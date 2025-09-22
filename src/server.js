const express = require("express");
const cors = require("cors");
const rootRoute = require("./router/index.js");
const { sendSuccess } = require("./utils/response.js");
const { connectDB } = require("./prisma/prisma.js");
const { PrismaClient } = require("@prisma/client");

require("dotenv").config();

const prisma = new PrismaClient();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  return sendSuccess(res, "Server is running", []);
});

app.use("/api",(req, res, next) => {
  console.log(`📌 ${req.method} ${req.originalUrl} called`);
  next(); // pass to next middleware/route
}, rootRoute);



const PORT = process.env.PORT || 8000;
app.listen(PORT,async () => {
 await connectDB()

  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = { prisma };
