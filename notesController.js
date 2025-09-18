import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model("Note", noteSchema);

// Ensure database connection for tests
async function ensureConnection() {
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/SSD";
    await mongoose.connect(mongoUri);
  }
}

// GET all notes
export async function getAllNotes(req, res) {
  await ensureConnection();
  const notes = await Note.find({});
  res.status(200).json(notes);
}

// POST create note
export async function createNotes(req, res) {
  await ensureConnection();
  const { title, content } = req.body;
  if (!title || !content)
    return res.status(400).json({ error: "Title and content required" });

  const note = new Note({ id: uuidv4(), title, content });
  const saved = await note.save();
  res.status(201).json(saved);
}

// PUT update note by id
export async function updateNotes(req, res) {
  await ensureConnection();
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content)
    return res.status(400).json({ error: "Title and content required" });

  const updated = await Note.findOneAndUpdate(
    { id },
    { title, content },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.status(200).json(updated);
}

// DELETE note by id
export async function deleteNotes(req, res) {
  await ensureConnection();
  const { id } = req.params;

  const deleted = await Note.findOneAndDelete({ id });

  if (!deleted) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.status(200).json(deleted);
}

export function resetNotes() {
  // Returning a promise but don't make the function async to match the test expectation
  return new Promise(async (resolve, reject) => {
    await ensureConnection();
    await Note.deleteMany({});
    console.log("All notes deleted for testing");
    resolve();
  });
}
