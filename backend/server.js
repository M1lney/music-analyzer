const express = require('express');
const cors = require('cors');
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const {unlink} = require("node:fs");

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

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', data => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', data => {
        errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error('Python script error:', errorOutput);
            res.status(500).send({'error': 'Error running python process'});
        }

        try {
            const analysis = JSON.parse(output);
            res.json({analysis} );
        } catch (parseError) {
            console.error('Error parsing Python output:', parseError);
            res.status(500).send({ error: 'Invalid output from Python script', details: parseError.message });
        }

        unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})