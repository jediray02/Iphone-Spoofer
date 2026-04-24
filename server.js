const express = require('express');
const multer = require('multer');
const exiftool = require('exiftool-vendored').exiftool;
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const API_KEY = process.env.API_KEY || "250286250286250286";

app.use(express.json());

app.use((req, res, next) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
});

app.post('/spoof', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const model = req.body.model || "iPhone 17 Pro";
  const location = req.body.location || "miami";

  let lat = 25.7617, lon = -80.1918;
  if (location === "alabama") { lat = 33.2158; lon = -87.5383; }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const newName = `IMG_${Math.floor(Math.random() * 3000) + 7000}${ext}`;
  const outputPath = path.join('output', newName);

  try {
    await exiftool.write(req.file.path, {
      Make: "Apple",
      Model: model,
      Software: model.includes("17") ? "iOS 19.2" : "iOS 18.2",
      DateTimeOriginal: new Date().toISOString(),
      CreateDate: new Date().toISOString(),
      ModifyDate: new Date().toISOString(),
      GPSLatitude: lat,
      GPSLatitudeRef: "N",
      GPSLongitude: lon,
      GPSLongitudeRef: "W"
    });

    fs.renameSync(req.file.path, outputPath);
    res.download(outputPath, newName, (err) => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error("Spoof error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Spoofer API running on port ${PORT}`));
