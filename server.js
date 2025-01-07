const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Mock database
let likeCount = 0;
const likedDevices = new Set(); // Stores device IPs or unique identifiers

// Get like count
app.get('/likes', (req, res) => {
    res.json({ count: likeCount });
});

// Handle like
app.post('/like', (req, res) => {
    const clientIp = req.ip;

    // Check if the device has already liked
    if (likedDevices.has(clientIp)) {
        return res.status(403).json({ message: 'You have already liked this!' });
    }

    // Register the like
    likedDevices.add(clientIp);
    likeCount++;

    res.json({ count: likeCount });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
