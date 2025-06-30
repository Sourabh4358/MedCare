// server/index.js

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db"); // Make sure db.js is in the same directory

const app = express();
const PORT = 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password, mobile, age, gender } = req.body;

  if (!name || !email || !password || !mobile || !age || !gender) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (name, email, password, mobile, age, gender)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, hashedPassword, mobile, age, gender], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Email already registered" });
        }
        return res.status(500).json({ error: "Signup failed" });
      }

      res.status(201).json({ message: "User registered successfully", userId: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", userId: user.id });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
