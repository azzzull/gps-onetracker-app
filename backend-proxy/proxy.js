import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 5000;
const TARGET_API = 'http://onetrack.abadiserver.my.id/api'; // Backend asli
const BEARER_TOKEN = 'wtv4iBavjfCY92DbxTCsUVDRGAAhuG9QK4Y7HoscIJRDwHzLPIWkwvQqcQ4JqlOv';

app.use(cors());
app.use(express.json());

// GET all vehicles or with query (start, qty, id)
app.get('/vehicle', async(req, res) => {
    const url = new URL(`${TARGET_API}/vehicle`);
    Object
        .entries(req.query)
        .forEach(([key, value]) => {
            url
                .searchParams
                .append(key, value);
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
        console.error('❌ GET /vehicle error:', err);
        res
            .status(500)
            .json({error: 'Gagal ambil data kendaraan'});
    }
});

// GET log data
app.get('/data', async(req, res) => {
    const url = new URL(`${TARGET_API}/data`);
    Object
        .entries(req.query)
        .forEach(([key, value]) => {
            url
                .searchParams
                .append(key, value);
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
        console.error('❌ GET /data error:', err);
        res
            .status(500)
            .json({error: 'Gagal ambil data log'});
    }
});

// POST add vehicle
app.post('/vehicle', async(req, res) => {
    try {
        const apiRes = await fetch(`${TARGET_API}/vehicle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${BEARER_TOKEN}`
            },
            body: JSON.stringify(req.body)
        });
        const data = await apiRes.json();
        res
            .status(apiRes.status)
            .json(data);
    } catch (err) {
        console.error('❌ POST /vehicle error:', err);
        res
            .status(500)
            .json({error: 'Gagal tambah kendaraan'});
    }
});

// PUT update vehicle
app.put('/vehicle', async(req, res) => {
    const url = new URL(`${TARGET_API}/vehicle`);
    if (req.query.id) 
        url.searchParams.append('id', req.query.id);
    
    try {
        const apiRes = await fetch(url.toString(), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${BEARER_TOKEN}`
            },
            body: JSON.stringify(req.body)
        });
        const data = await apiRes.json();
        res
            .status(apiRes.status)
            .json(data);
    } catch (err) {
        console.error('❌ PUT /vehicle error:', err);
        res
            .status(500)
            .json({error: 'Gagal update kendaraan'});
    }
});

/// DELETE vehicle
app.delete('/vehicle', async(req, res) => {
    try {
        const apiRes = await fetch(`${TARGET_API}/vehicle`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${BEARER_TOKEN}`
            },
            body: JSON.stringify({id: req.query.id}), // Kirim ID ke body
        });

        const contentType = apiRes
            .headers
            .get('content-type');
        const status = apiRes.status;

        if (contentType && contentType.includes('application/json')) {
            const data = await apiRes.json();
            res
                .status(status)
                .json(data);
        } else {
            const text = await apiRes.text();
            res
                .status(status)
                .send(text);
        }
    } catch (err) {
        console.error('❌ DELETE /vehicle error:', err);
        res
            .status(500)
            .json({error: 'Gagal hapus kendaraan'});
    }
});

// GET vehicle by id (proxy ke backend asli jika backend asli support)
app.get('/vehicle/byid/:id', async (req, res) => {
    try {
        const apiRes = await fetch(`${TARGET_API}/vehicle/byid/${req.params.id}`, {
            headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`
            }
        });
        const data = await apiRes.json();
        res.status(apiRes.status).json(data);
    } catch (err) {
        console.error('❌ GET /vehicle/byid/:id error:', err);
        res.status(500).json({ error: 'Gagal ambil detail kendaraan by id' });
    }
});

// GET all alerts or with query (proxy ke backend asli jika support)
app.get('/alert', async(req, res) => {
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

// Start server
app.listen(PORT, () => {
    console.log(`✅ Proxy server berjalan di http://localhost:${PORT}`);
});
