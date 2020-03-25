import { thunk, thunkOn, action, actionOn } from 'easy-peasy'
import _ from 'lodash'
import io from 'socket.io-client'
import { getFunctionName } from '../../util'

export const userName = null;
export const roomId = null;
export const roomName = null;
export const availableRooms = [];
export const socket = null;
export const isConnected = false;

export const fetchAvailableRooms = thunk(async (actions, payload) => {
    console.log(`[${getFunctionName()}] in`)

    try {
        const response = await fetch('/api/rooms', {
            headers: { "Content Type": "application/json" },
        })

        if (response.ok) {
            const result = await response.json();
            actions.setAvailableRooms(result.available)
        } else {
            console.log(`[${getFunctionName()}]`, { response })
        }
    }
    catch (error) {
        console.log(`[${getFunctionName()}]`, { error })
    }
})

export const setIsConnected = action((state, payload) => {
    state.isConnected = payload;
})

export const setAvailableRooms = action((state, payload) => {
    state.availableRooms = payload;
})

export const setSocket = action((state, payload) => {
    state.socket = payload;
})

export const setRoomId = action((state, payload) => {
    state.roomId = payload;
})

export const setRoomName = action((state, payload) => {
    state.roomName = payload;
})

export const setUserName = action((state, payload) => {
    state.userName = payload;
})

export const connect = thunk((actions, payload) => {
    const socket = io();

    socket.on('connect', () => {
        actions.setIsConnected(socket.connected)
    })

    socket.on('message', function (message) {
        console.log(message);
    })

    socket.on('roomId', roomId => {
        setRoomId(roomId);
    })

    actions.setSocket(socket);

})

export const createRoom = action((state, payload) => {
    const { roomName, userName } = payload;
    if (state.socket)
        state.socket.emit('create_room', roomName, userName)
})

export const leaveRoom = action((state, payload) => {
    const { roomId, socket } = state;
    if (socket && roomId)
        socket.emit('leave_room', roomId);
})

export const joinRoom = action((state, payload) => {
    const { roomId } = payload;
    const { socket, userName } = state;
    if (socket)
        socket.emit('join_room', roomId, userName);
})