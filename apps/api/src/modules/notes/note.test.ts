import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

async function createNote(token: string, body: Record<string, unknown>) {
  return request(app).post("/api/notes").set("Authorization", `Bearer ${token}`).send(body);
}

describe("notes module", () => {
  it("creates and fetches a note", async () => {
    const token = await registerAndGetToken(app);
    const created = await createNote(token, { title: "Meeting Notes", content: "hello world" });
    expect(created.status).toBe(201);

    const fetched = await request(app).get(`/api/notes/${created.body.data.note.id}`).set("Authorization", `Bearer ${token}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.note.title).toBe("Meeting Notes");
  });

  it("rejects a note with no title", async () => {
    const token = await registerAndGetToken(app);
    const res = await createNote(token, { content: "no title" });
    expect(res.status).toBe(400);
  });

  it("full-text searches notes with a snippet", async () => {
    const token = await registerAndGetToken(app);
    await createNote(token, { title: "Recipe", content: "a delicious chocolate cake recipe" });
    await createNote(token, { title: "Unrelated", content: "totally different topic" });

    const res = await request(app).get("/api/notes/search?q=chocolate").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.notes).toHaveLength(1);
    expect(res.body.data.notes[0].snippet).toContain("chocolate");
  });

  it("resolves [[wiki-links]] and exposes backlinks + graph", async () => {
    const token = await registerAndGetToken(app);
    const target = await createNote(token, { title: "Target Note", content: "the destination" });
    const source = await createNote(token, { title: "Source Note", content: "linking to [[Target Note]]" });

    const backlinks = await request(app)
      .get(`/api/notes/${target.body.data.note.id}/backlinks`)
      .set("Authorization", `Bearer ${token}`);
    expect(backlinks.body.data.backlinks).toHaveLength(1);

    const graph = await request(app).get("/api/notes/graph").set("Authorization", `Bearer ${token}`);
    expect(graph.body.data.nodes).toHaveLength(2);
    expect(graph.body.data.edges).toHaveLength(1);
    expect(graph.body.data.edges[0].source).toBe(source.body.data.note.id);
    expect(graph.body.data.edges[0].target).toBe(target.body.data.note.id);
  });

  it("gets-or-creates today's daily note idempotently", async () => {
    const token = await registerAndGetToken(app);
    const first = await request(app).get("/api/notes/daily").set("Authorization", `Bearer ${token}`);
    const second = await request(app).get("/api/notes/daily").set("Authorization", `Bearer ${token}`);
    expect(first.body.data.note.id).toBe(second.body.data.note.id);
  });

  it("syncs a #task checkbox to a real task, and reflects task completion back", async () => {
    const token = await registerAndGetToken(app);
    const created = await createNote(token, { title: "Todo Note", content: "- [ ] Buy milk #task" });
    expect(created.body.data.note.content).toMatch(/<!--task:[0-9a-f]{24}-->/);

    const taskIdMatch = created.body.data.note.content.match(/<!--task:([0-9a-f]{24})-->/);
    const taskId = taskIdMatch[1];

    // Complete the task via the Tasks API (not through the note).
    await request(app).post(`/api/tasks/${taskId}/complete`).set("Authorization", `Bearer ${token}`).send({});

    // Reading the note back should show it checked, without us re-saving.
    const fetched = await request(app).get(`/api/notes/${created.body.data.note.id}`).set("Authorization", `Bearer ${token}`);
    expect(fetched.body.data.note.content).toMatch(/- \[x\] Buy milk #task/);
  });

  it("does not create a duplicate task when a #task line is re-saved", async () => {
    const token = await registerAndGetToken(app);
    const created = await createNote(token, { title: "Todo Note 2", content: "- [ ] Walk dog #task" });
    const contentWithMarker = created.body.data.note.content;

    await request(app)
      .patch(`/api/notes/${created.body.data.note.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: contentWithMarker });

    const tasksRes = await request(app).get("/api/tasks").set("Authorization", `Bearer ${token}`);
    const walkDogTasks = tasksRes.body.data.tasks.filter((t: { title: string }) => t.title === "Walk dog");
    expect(walkDogTasks).toHaveLength(1);
  });

  it("saves and restores from a note template", async () => {
    const token = await registerAndGetToken(app);
    const source = await createNote(token, { title: "Standup Format", content: "## Yesterday\n## Today" });
    const template = await request(app)
      .post(`/api/notes/${source.body.data.note.id}/save-template`)
      .set("Authorization", `Bearer ${token}`);
    expect(template.status).toBe(201);

    const fromTemplate = await request(app)
      .post(`/api/notes/${template.body.data.template.id}/create-from-template`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Standup 2026-03-05" });
    expect(fromTemplate.status).toBe(201);
    expect(fromTemplate.body.data.note.content).toBe("## Yesterday\n## Today");
  });

  it("tracks revision history and can restore an old revision", async () => {
    const token = await registerAndGetToken(app);
    const created = await createNote(token, { title: "Evolving", content: "v1" });
    await request(app)
      .patch(`/api/notes/${created.body.data.note.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "v2" });

    const revisions = await request(app)
      .get(`/api/notes/${created.body.data.note.id}/revisions`)
      .set("Authorization", `Bearer ${token}`);
    expect(revisions.body.data.revisions.length).toBeGreaterThanOrEqual(2);
    const firstRevision = revisions.body.data.revisions[revisions.body.data.revisions.length - 1];

    const restored = await request(app)
      .post(`/api/notes/${created.body.data.note.id}/revisions/${firstRevision._id}/restore`)
      .set("Authorization", `Bearer ${token}`);
    expect(restored.body.data.note.content).toBe("v1");
  });

  it("exports a note as markdown", async () => {
    const token = await registerAndGetToken(app);
    const created = await createNote(token, { title: "Exportable", content: "# Hello" });
    const res = await request(app).get(`/api/notes/${created.body.data.note.id}/export`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/markdown");
    expect(res.text).toBe("# Hello");
  });

  it("404s fetching a note that belongs to someone else", async () => {
    const tokenA = await registerAndGetToken(app, "owner3@example.com");
    const tokenB = await registerAndGetToken(app, "intruder3@example.com");
    const created = await createNote(tokenA, { title: "Private" });
    const res = await request(app).get(`/api/notes/${created.body.data.note.id}`).set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });
});
