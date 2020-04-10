require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
const morgan = require('morgan');
const fetch = require('node-fetch')
const { v4: uuid } = require('uuid');
const _ = require('lodash')

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

//#region REST

app.get('/api/ping', (req, res) => {
    res.status(200).end('pong!');
})

app.get('/api/rooms', function (req, res) {
    res.json({ all_rooms: rooms, available: getAvailableRooms(rooms) });
});

class Card {
    constructor(id, index, url, description) {
        this.isUp = false;
        this.id = id;
        this.index = index;
        this.url = url;
        this.isActive = true;
        this.description = description;
    }
}

app.get('/api/cards', async (req, res) => {
    const { roomId } = req.query;

    if (!(roomId in rooms)) {
        return res.status(400).send(`room id ${roomId} not exists`)
    }

    if (rooms[roomId].cards && rooms[roomId].cards.length > 0) {
        console.log(`[/api/cards] using cards of room id=${roomId}`)
        return res.status(200).json(rooms[roomId].cards)
    }

    else {
        try {
            const response = await fetch(
                `https://api.unsplash.com/photos/`
                + `?client_id=${process.env.UNSPLASH_ACCESS_KEY}`
                + `&per_page=${parseInt(process.env.CARDS_COUNT) / 2}`)

            if (response.ok) {
                const result = await response.json()
                let cards = result.map((photo, index) => new Card(photo.id, index, photo.urls.small, photo.alt_description))
                cards = [...cards, ...result.map((photo, index) => new Card(photo.id, index + cards.length, photo.urls.small, photo.alt_description))]
                cards = _.shuffle(cards)

                console.log('[/api/cards] cards override')
                rooms[roomId].cards = cards;

                return res.status(200).json(cards)
            } else {
                const message = `response is not ok ` +
                    `status: ${response.status} ${response.text}`;
                console.log({ message, response })
                return res.status(500).send(`[unsplash service failed] ${message}`)
            }
        } catch (error) {
            console.log('[get /api/cards]', error);
            return res.status(500).send('Server Error');
        }
    }
})

//#endregion

//#region socket.io

io.on('connection', function (socket) {
    console.log(`user ${socket.id} connected`);
    socket.send(`welcome, user id: ${socket.id}`)

    socket.on('create_room', function (roomName, userName) {
        console.log('create_room', { roomName, userName })

        roomId = uuid();
        rooms[roomId] = { users: [{ id: socket.id, name: userName }], name: roomName };
        socket.join(roomId);
        socket.emit('roomId', roomId, rooms[roomId].users.length);
        socket.send(`joined room ${roomName} = ${roomId}, awaiting another player to join`)

        socket.emit('turn_change', true)
    })

    socket.on('join_room', function (roomId, userName) {
        console.log('join_room', { roomId, userName })

        if (roomId in rooms) {
            socket.join(roomId)
            rooms[roomId].users.push({ id: socket.id, name: userName })

            socket.emit('roomId', roomId, rooms[roomId].users.length);
            socket.broadcast.to(roomId).emit('other_player_join', socket.id, userName, rooms[roomId].users.length);

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

    socket.on('flip_card', (roomId, cardIndex) => {
        console.log('[flip_card]', { roomId, cardIndex })
        const user = rooms[roomId].users.find(user => user.id === socket.id) || {};
        socket.broadcast.to(roomId).emit('other_player_flip_card', user.name, cardIndex)
    })

    socket.on('turn_end', (roomId) => {
        const user = rooms[roomId].users.find(user => user.id === socket.id) || {};
        console.log('[turn_end]', { roomId, userName: user.name })
        socket.broadcast.to(roomId).emit('turn_change', true)
    })
});

//#endregion

