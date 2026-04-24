const express = require('express');
const multer = require('multer');
const exiftool = require('exiftool-vendored').exiftool;
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Your secret API key (change this later)
const API_KEY = "your-secret-key-here-12345";

app.use(express.json());

// Check API key
app.use((req, res, next) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
});

app.post('/spoof', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });

  const model = req.body.model || "iPhone 17 Pro";
  const location = req.body.location || "miami";

  let lat = 25.7617;
  let lon = -80.1918;
  if (location === "alabama") {
    lat = 33.2158;
    lon = -87.5383;
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const newName = `IMG_${Math.floor(Math.random() * 3000) + 7000}${ext}`;
  const outputPath = path.join('output', newName);

  try {
    await exiftool.write(req.file.path, {
      Make: "Apple",
      Model: model,
      Software: model.includes("17") ? "iOS 19.2" : "iOS 18.2",
      DateTimeOriginal: new Date(),
      CreateDate: new Date(),
      ModifyDate: new Date(),
      GPSLatitude: lat,
      GPSLatitudeRef: "N",
      GPSLongitude: lon,
      GPSLongitudeRef: "W",
      LensMake: "Apple",
      LensModel: model + " back triple camera 6.765mm f/1.78"
    });

    fs.renameSync(req.file.path, outputPath);

    res.download(outputPath, newName, () => fs.unlinkSync(outputPath));
  } catch (err) {
    res.status(500).json({ error: 'Failed to spoof' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Spoofer API running on port ${PORT}`));
