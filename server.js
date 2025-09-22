// server.js
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const pty = require('node-pty');
const path = require('path');

const app = express();
const port = 3000;

// Serve static frontend (optional, not used with userscript)
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Start HTTP server
const server = app.listen(port, () => {
    console.log(`Terminal backend listening at http://localhost:${port}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('[WS] New connection established');

    // Choose shell
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';

    // Start pseudo-terminal
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    // Send terminal output to client
    ptyProcess.onData((data) => {
        ws.send(data);
    });

    // Receive input from client
    ws.on('message', (msg) => {
        ptyProcess.write(msg);
    });

    ws.on('close', () => {
        console.log('[WS] Connection closed');
        ptyProcess.kill();
    });
});