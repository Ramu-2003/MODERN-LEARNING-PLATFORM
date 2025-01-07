const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

// Simulated database
let likes = 0;
let views = 0;
const userInteractions = {}; // Store user interactions by IP address or unique identifier

// Middleware to get client IP address
const getClientIp = (req) =>
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

// Endpoint to fetch data
app.get("/data", (req, res) => {
    const ip = getClientIp(req);
    res.json({
        likes,
        views,
        hasLiked: !!userInteractions[ip]?.liked,
    });
});

// Endpoint to handle likes
app.post("/like", (req, res) => {
    const ip = getClientIp(req);
    if (userInteractions[ip]?.liked) {
        return res.status(400).json({ message: "You have already liked." });
    }

    likes++;
    userInteractions[ip] = { ...userInteractions[ip], liked: true };
    res.json({ likes });
});

// Endpoint to increment views
app.post("/view", (req, res) => {
    const ip = getClientIp(req);

    if (!userInteractions[ip]?.viewed) {
        views++;
        userInteractions[ip] = { ...userInteractions[ip], viewed: true };
    }

    res.json({ views });
});

// Start server
app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
