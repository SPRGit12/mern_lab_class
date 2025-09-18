import request from "supertest";
import app from "../src/server.js";
import { resetNotes } from "../src/controller/notesController.js";

beforeEach(() => resetNotes());

describe("Notes API", () => {
  it("GET /api/notes should return empty array initially", async () => {
    const res = await request(app).get("/api/notes");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("POST /api/notes should create a new note", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Test Note", content: "Hello World" });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Note");
    expect(res.body.content).toBe("Hello World");
    expect(res.body).toHaveProperty("id");
  });

  it("PUT /api/notes/:id should update a note", async () => {
    const createRes = await request(app)
      .post("/api/notes")
      .send({ title: "Old", content: "Old content" });

    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/notes/${id}`)
      .send({ title: "Updated", content: "Updated content" });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.title).toBe("Updated");
    expect(updateRes.body.content).toBe("Updated content");
  });

  it("DELETE /api/notes/:id should delete a note", async () => {
    const createRes = await request(app)
      .post("/api/notes")
      .send({ title: "To delete", content: "Delete me" });

    const id = createRes.body.id;

    const deleteRes = await request(app).delete(`/api/notes/${id}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.title).toBe("To delete");

    // Confirm deletion
    const getRes = await request(app).get("/api/notes");
    expect(getRes.body.find((n) => n.id === id)).toBeUndefined();
  });
});

describe("Sequential Notes API flow", () => {
  it("should handle POST, GET, PUT, DELETE in sequence", async () => {
    console.log("\n---- Sequence Test Start ----");

    const notesToCreate = [
      { title: "Note 1", content: "Content 1" },
      { title: "Note 2", content: "Content 2" },
      { title: "Note 3", content: "Content 3" },
    ];

    const createdNotes = [];

    // 1. Create 3 notes
    for (const note of notesToCreate) {
      const res = await request(app).post("/api/notes").send(note);
      expect(res.statusCode).toBe(201);
      createdNotes.push(res.body);
      console.log(`Created: ${res.body.title} (ID: ${res.body.id})`);
    }

    // 2. Get all notes
    let getRes = await request(app).get("/api/notes");
    expect(getRes.statusCode).toBe(200);
    console.log("All Notes After Creation:", getRes.body);

    // 3. Update the second note
    const noteToUpdate = createdNotes[1];
    const updateRes = await request(app)
      .put(`/api/notes/${noteToUpdate.id}`)
      .send({ title: "Updated Note 2", content: "Updated Content 2" });
    expect(updateRes.statusCode).toBe(200);
    console.log("Updated Note 2:", updateRes.body);

    // 4. Delete the first note
    const noteToDelete = createdNotes[0];
    const deleteRes = await request(app).delete(
      `/api/notes/${noteToDelete.id}`
    );
    expect(deleteRes.statusCode).toBe(200);
    console.log("Deleted Note 1:", deleteRes.body);

    // 5. Final check
    getRes = await request(app).get("/api/notes");
    expect(getRes.statusCode).toBe(200);
    console.log("Final Notes List:", getRes.body);

    console.log("---- Sequence Test End ----\n");
  });
});
