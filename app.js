require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Securely stored credentials
//const mongoUrl = process.env.MONGO_URL;
//const JWT_SECRET = process.env.JWT_SECRET;
const mongoUrl = "mongodb+srv://amitjbhardwaj:admin@cluster0.mcxgr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

// Connect to MongoDB
mongoose
    .connect(mongoUrl)
    .then(() => console.log("✅ Database Connected"))
    .catch((err) => console.error("❌ DB Connection Error:", err));

require("./UserDetails");
const User = mongoose.model("UserInfo");

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ error: "Access Denied" });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid Token" });
    }
};

// Route: Test Server
app.get("/", (req, res) => {
    res.json({ status: "Server Running" });
});

// Route: Register User
app.post("/register", async (req, res) => {
    const { role, firstName, lastName, email, password, aadhar, accountHolder, accountNumber, ifsc, branch, mobile } = req.body;

    // Check if user exists
    const oldUser = await User.findOne({ email });
    if (oldUser) return res.status(400).json({ error: "User already exists" });

    // Hash password
    const encryptedPassword = await bcrypt.hash(password, 12);

    try {
        const newUser = await User.create({
            role, firstName, lastName, email, password: encryptedPassword,
            aadhar, accountHolder, accountNumber, ifsc, branch, mobile
        });

        res.status(201).json({ message: "User Created", userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: "Registration failed", details: error.message });
    }
});

// Route: User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, userType: user.role });
});

// Route: Get User Data (Protected)
app.get("/userdata", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ status: "Success", data: user });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving user data" });
    }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
