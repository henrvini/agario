// const express = require('express');
// const app = express();

// app.use(express.static(__dirname + '/public'));

// const expressServer = app.listen(9000);
// const socketio = require('socket.io');
// const io = socketio(expressServer);

// module.exports = { app, io };

const http = require('http');
const socketio = require('socket.io');

const app = http.createServer((req, res) => {
    res.end('I am connected');
});

const io = socketio(app, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: false
    }
});

app.listen(9000);

module.exports = { app, io };
