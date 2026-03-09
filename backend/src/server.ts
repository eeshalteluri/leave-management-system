import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

import authRoutes from "./routes/authRoutes";
import leaveRoutes from "./routes/leaveRoutes";

dotenv.config();

const PORT = process.env.PORT

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});