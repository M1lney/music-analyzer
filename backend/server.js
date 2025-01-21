const express = require('express');
const cors = require('cors');
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");

const app = express();

app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Get the original file extension
        cb(null, Date.now() + ext);  // Store file with its original extension and a timestamp
    }
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("audioFile"), (req, res) => {
    if (!req.file) {
        return res.status(400).send({'error': 'No file uploaded'});
    }

    const pythonProcess = spawn('python3', [
        'python/essentia_analysis.py',
        path.join(__dirname, req.file.path),
    ]);

    pythonProcess.stdout.on('data', data => {
        const output = data.toString();
        console.log("Python Output:", output);  // Ensure this is printed
        res.json({ analysis: output });
    });

    pythonProcess.stderr.on('data', data => {
        console.error('stderr:', data);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).send({'error': 'Error running python process'});
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})