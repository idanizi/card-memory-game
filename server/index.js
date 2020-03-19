require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
const morgan = require('morgan');
const uuid = require('uuid/v4')

const rooms = {};
const MAX_PLAYERS_COUNT = 2;

server.listen(process.env.PORT, function () {
    console.log(`listening on ${process.env.PORT}`);
});

app.use(morgan("common"));

function getAvailableRooms(rooms) {
    return Object.entries(rooms)
        .filter(([roomId, { users }]) => users.length < MAX_PLAYERS_COUNT)
        .map(([roomId, { users }]) => roomId)
}

app.get('/api/rooms', function (req, res) {
    res.json({ all_rooms: rooms, available: getAvailableRooms(rooms) });
});

io.on('connection', function (socket) {
    console.log(`user ${socket.id} connected`);
    socket.send(`welcome, user id: ${socket.id}`)

    socket.on('create_room', function (roomName, userName) {
        console.log('create_room', { roomName, userName })

        roomId = uuid();
        rooms[roomId] = { users: [{ id: socket.id, name: userName }], name: roomName };
        socket.join(roomId);
        socket.emit('roomId', roomId);
        socket.send(`joined room ${roomName} = ${roomId}, awaiting another player to join`)
    })

    socket.on('join_room', function (roomId, userName) {
        console.log('join_room', { roomId, userName })

        if (roomId in rooms) {
            socket.join(roomId)
            socket.emit('roomId', roomId);
            rooms[roomId].users.push({ id: socket.id, name: userName })
            socket.broadcast.to(roomId).send(`${userName} joined!`)
            socket.send(`you joined to room ${rooms[roomId].name}.`)
        } else {
            const message = `no such room ${roomId}`
            console.log(message)
            socket.error(message)
        }
    })

    socket.on('leave_room', function (roomId) {
        console.log('leave_room', { roomId })

        if (roomId in rooms) {
            socket.leave(roomId)
            const user = rooms[roomId].users.splice(rooms[roomId].users.findIndex(x => x.id === socket.id), 1)

            if (rooms[roomId].users.length === 0) {
                delete rooms[roomId];
            } else {
                socket.broadcast.to(roomId).send(`${(user || {}).name} left.`)
            }

            socket.send(`you left room ${rooms[roomId].name}.`)
        } else {
            const message = `no such room ${roomId}`
            console.log(message)
            socket.error(message)
        }
    })

});

