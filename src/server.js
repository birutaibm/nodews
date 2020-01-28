const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Processors = require('./Processors');

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        Processors.proccess(JSON.parse(message), ws);
    });
});

//start our server
// server.listen(process.env.PORT || 8999, () => {
//     console.log(`Server started on port ${server.address().port} :)`);
// });

module.exports = server;