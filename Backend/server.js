const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 5000;

const router = require('./router');

io.on('connection', (socket) => { /* socket object may be used to send specific messages to the new connected client */
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });
        if (error) return callback(error);
        socket.emit('message', { user: 'admin', text: `${user.name} Welcome to ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has Joined` })
        socket.join(user.room);

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: user.name, text: message });
        callback();
    });
    socket.on('disconnect', () => {

    });
});


app.use(router);

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});