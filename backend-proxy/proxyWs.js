import {WebSocketServer, WebSocket} from 'ws'; // Import both server and client
import http from 'http';

const PORT = 5001;
const TARGET_WS = 'wss://onetrack.abadiserver.my.id';
const BEARER_TOKEN = 'your_token_here';

const server = http.createServer();
const wss = new WebSocketServer({server});

// Track connections
const connections = new Set();

wss.on('connection', (clientWs) => {
    console.log('New client connected');
    connections.add(clientWs);

    // Connect to target server
    const targetWs = new WebSocket(TARGET_WS);

    targetWs.on('open', () => {
        console.log('Connected to target server');
        // Authenticate with target server
        targetWs.send(JSON.stringify({type: 'auth', token: BEARER_TOKEN}));
    });

    // Prevent echo loop: only forward data if not already from the other side
    let isForwardingFromClient = false;
    let isForwardingFromTarget = false;

    // Forward messages from client to target
    clientWs.on('message', (data) => {
        if (isForwardingFromTarget) return; // Prevent echo
        isForwardingFromClient = true;
        try {
            // Optionally filter message type here
            if (targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(data);
            }
        } finally {
            isForwardingFromClient = false;
        }
    });

    // Forward messages from target to client
    targetWs.on('message', (data) => {
        if (isForwardingFromClient) return; // Prevent echo
        isForwardingFromTarget = true;
        try {
            // Optionally filter message type here
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(data);
            }
        } finally {
            isForwardingFromTarget = false;
        }
    });

    // Error handling
    clientWs.on('error', (err) => {
        console.error('Client error:', err);
        targetWs.close();
    });

    targetWs.on('error', (err) => {
        console.error('Target error:', err);
        clientWs.close();
    });

    // Cleanup
    const cleanup = () => {
        connections.delete(clientWs);
        if (targetWs.readyState === WebSocket.OPEN) {
            targetWs.close();
        }
    };

    clientWs.on('close', cleanup);
    targetWs.on('close', cleanup);
});

server.listen(PORT, () => {
    console.log(`✅ Proxy running on ws://localhost:${PORT}`);
    console.log(`Proxying to: ${TARGET_WS}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nClosing all connections...');
    connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.close(1001, 'Server shutdown');
        }
    });
    server.close(() => process.exit());
});