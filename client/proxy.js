const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 5000;

const API_URL = 'http://onetrack.abadiserver.my.id/api';
const BEARER_TOKEN = 'Bearer wtv4iBavjfCY92DbxTCsUVDRGAAhuG9QK4Y7HoscIJRDwHzLPIWkwvQqcQ4JqlOv';

app.use(express.json());

app.get('/vehicle', async(req, res) => {
    try {
        const response = await fetch(`${API_URL}/vehicle`, {
            headers: {
                Authorization: BEARER_TOKEN
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({message: 'Error from proxy server'});
    }
});

// Tambahkan endpoint lain jika perlu

app.listen(port, () => {
    console.log(`Proxy server running on http://localhost:${port}`);
});
