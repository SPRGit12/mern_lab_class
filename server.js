import express from "express";
import dotenv from "dotenv";
import router from "./routes/notesRouter.js";
import { connectDB } from "./config/db.js";

dotenv.config(); // Load .env variables

const app = express();

// Middleware
app.use(express.json());
app.use("/api/notes", router);

const PORT = process.env.PORT || 5001;

// Only start the server if NOT in test mode
if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log("Server started on PORT:", PORT);
    });
  });
} else {
  connectDB();
}

export default app; // Export app for tests
