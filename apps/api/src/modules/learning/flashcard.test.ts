import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { registerAndGetToken } from "../../tests/helpers.js";

const app = createApp();

describe("flashcards module", () => {
  it("creates a deck and bulk-creates cards", async () => {
    const token = await registerAndGetToken(app);
    const deck = await request(app).post("/api/decks").set("Authorization", `Bearer ${token}`).send({ name: "Spanish" });
    expect(deck.status).toBe(201);

    const bulk = await request(app)
      .post("/api/cards/bulk")
      .set("Authorization", `Bearer ${token}`)
      .send({
        deckId: deck.body.data.deck.id,
        cards: [
          { front: "hola", back: "hello" },
          { front: "adios", back: "goodbye" },
        ],
      });
    expect(bulk.status).toBe(201);
    expect(bulk.body.data.cards).toHaveLength(2);
  });

  it("lists decks with due counts, and new cards are immediately due", async () => {
    const token = await registerAndGetToken(app);
    const deck = await request(app).post("/api/decks").set("Authorization", `Bearer ${token}`).send({ name: "French" });
    await request(app).post("/api/cards").set("Authorization", `Bearer ${token}`).send({ deckId: deck.body.data.deck.id, front: "bonjour", back: "hello" });

    const decks = await request(app).get("/api/decks").set("Authorization", `Bearer ${token}`);
    expect(decks.body.data.decks[0].dueCount).toBe(1);

    const due = await request(app).get(`/api/cards/due?deckId=${deck.body.data.deck.id}`).set("Authorization", `Bearer ${token}`);
    expect(due.body.data.count).toBe(1);
  });

  it("reviewing a card updates its SRS state and records a CardReview", async () => {
    const token = await registerAndGetToken(app);
    const deck = await request(app).post("/api/decks").set("Authorization", `Bearer ${token}`).send({ name: "Deck" });
    const card = await request(app).post("/api/cards").set("Authorization", `Bearer ${token}`).send({ deckId: deck.body.data.deck.id, front: "f", back: "b" });

    const reviewed = await request(app)
      .post(`/api/cards/${card.body.data.card.id}/review`)
      .set("Authorization", `Bearer ${token}`)
      .send({ grade: "good" });
    expect(reviewed.status).toBe(200);
    expect(reviewed.body.data.card.srs.state).toBe("review");
    expect(reviewed.body.data.card.srs.intervalDays).toBe(1);

    const heatmap = await request(app).get("/api/cards/heatmap").set("Authorization", `Bearer ${token}`);
    expect(heatmap.body.data.heatmap.length).toBeGreaterThanOrEqual(1);
    expect(heatmap.body.data.heatmap[0].count).toBe(1);
  });

  it("computes deck retention stats after some reviews", async () => {
    const token = await registerAndGetToken(app);
    const deck = await request(app).post("/api/decks").set("Authorization", `Bearer ${token}`).send({ name: "Stats Deck" });
    const c1 = await request(app).post("/api/cards").set("Authorization", `Bearer ${token}`).send({ deckId: deck.body.data.deck.id, front: "1", back: "1" });
    const c2 = await request(app).post("/api/cards").set("Authorization", `Bearer ${token}`).send({ deckId: deck.body.data.deck.id, front: "2", back: "2" });

    await request(app).post(`/api/cards/${c1.body.data.card.id}/review`).set("Authorization", `Bearer ${token}`).send({ grade: "good" });
    await request(app).post(`/api/cards/${c2.body.data.card.id}/review`).set("Authorization", `Bearer ${token}`).send({ grade: "again" });

    const stats = await request(app).get(`/api/decks/${deck.body.data.deck.id}/stats`).set("Authorization", `Bearer ${token}`);
    expect(stats.body.data.retention).toBe(50);
    expect(stats.body.data.forecast).toHaveLength(7);
  });

  it("404s reviewing a card that doesn't belong to the user", async () => {
    const tokenA = await registerAndGetToken(app, "ca@example.com");
    const tokenB = await registerAndGetToken(app, "cb@example.com");
    const deck = await request(app).post("/api/decks").set("Authorization", `Bearer ${tokenA}`).send({ name: "Private Deck" });
    const card = await request(app).post("/api/cards").set("Authorization", `Bearer ${tokenA}`).send({ deckId: deck.body.data.deck.id, front: "f", back: "b" });

    const res = await request(app)
      .post(`/api/cards/${card.body.data.card.id}/review`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ grade: "good" });
    expect(res.status).toBe(404);
  });
});
