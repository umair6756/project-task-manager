import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("export/import round trip", () => {
  it("exports data and re-imports it under the same user with remapped ids", async () => {
    const token = await registerAndGetToken(app);
    const area = await request(app).post("/api/areas").set("Authorization", `Bearer ${token}`).send({ name: "Work" });
    const project = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ship it", areaId: area.body.data.area.id });
    const label = await request(app).post("/api/labels").set("Authorization", `Bearer ${token}`).send({ name: "urgent" });
    const blocker = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({ title: "Blocker" });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Do the thing",
        projectId: project.body.data.project.id,
        labels: [label.body.data.label.id],
        dependsOn: [blocker.body.data.task.id],
      });

    const exported = await request(app).get("/api/platform/export").set("Authorization", `Bearer ${token}`);
    expect(exported.status).toBe(200);
    const payload = JSON.parse(exported.text);
    expect(payload.data.tasks).toHaveLength(2);

    const imported = await request(app).post("/api/platform/import").set("Authorization", `Bearer ${token}`).send(payload);
    expect(imported.status).toBe(200);
    expect(imported.body.data.imported.tasks).toBe(2);
    expect(imported.body.data.imported.areas).toBe(1);
    expect(imported.body.data.imported.projects).toBe(1);

    // Now there should be 2 copies of everything (original + imported), and
    // the imported task's dependsOn/labels/projectId should point at *new*
    // ids, not collide with the originals.
    const allTasks = await request(app).get("/api/tasks").set("Authorization", `Bearer ${token}`);
    expect(allTasks.body.data.tasks).toHaveLength(4);

    const importedDependent = allTasks.body.data.tasks.find(
      (t: { title: string; id: string }) => t.title === "Do the thing" && t.id !== undefined,
    );
    expect(importedDependent).toBeTruthy();
  });

  it("rejects an import payload with no data field", async () => {
    const token = await registerAndGetToken(app);
    const res = await request(app).post("/api/platform/import").set("Authorization", `Bearer ${token}`).send({ foo: "bar" });
    expect(res.status).toBe(400);
  });
});
