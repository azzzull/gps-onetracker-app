// Proxy endpoint untuk alert (jika backend asli support /alert)
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const TARGET_API = 'http://onetrack.abadiserver.my.id/api';
const BEARER_TOKEN = 'wtv4iBavjfCY92DbxTCsUVDRGAAhuG9QK4Y7HoscIJRDwHzLPIWkwvQqcQ4JqlOv';

// GET all alerts or with query
router.get('/alert', async (req, res) => {
    const url = new URL(`${TARGET_API}/alert`);
    Object.entries(req.query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    try {
        const apiRes = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`
            }
        });
        const data = await apiRes.json();
        res.json(data);
    } catch (err) {
        console.error('❌ GET /alert error:', err);
        res.status(500).json({ error: 'Gagal ambil data alert' });
    }
});

export default router;
