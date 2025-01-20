const express = require('express');
const cors = require('cors');
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");

const app = express();

app.use(cors());

const upload = multer({dest: "./uploads/"});

app.post("/upload", upload.single("audioFile"), (req, res) => {
    if (!req.file) {
        return res.status(400).send({'error': 'No file uploaded'});
    }

    const pythonProcess = spawn('python3', [
        'python/essentia_analysis.py',
        path.join(__dirname, req.file.path),
    ]);

    pythonProcess.stdout.on('data', data => {
        const output = data.toString();
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})