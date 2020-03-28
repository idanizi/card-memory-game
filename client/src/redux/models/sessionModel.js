import { thunk, thunkOn, action, actionOn } from 'easy-peasy'
import _ from 'lodash'
import io from 'socket.io-client'

const MINIMUM_PAYERS_COUNT_TO_PLAY = 2;

export const userName = '';
export const roomId = '';
export const roomName = '';
export const availableRooms = [];
export const socket = null;
export const isConnected = false;
export const isAwaitingOtherPlayer = false;
export const opponent = { id: '', userName: '' };
export const isInsideRoom = false;

export const fetchAvailableRooms = thunk(async (actions) => {
    console.log(`[fetchAvailableRooms] in`)

    try {
        const response = await fetch('/api/rooms')

        if (response.ok) {
            const result = await response.json();
            actions.setAvailableRooms(result.available)
        } else {
            console.log(`[fetchAvailableRooms]`, { response })
        }
    }
    catch (error) {
        console.log(`[fetchAvailableRooms]`, { error })
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

export const setIsAwaitingOtherPlayer = action((state, payload) => {
    state.isAwaitingOtherPlayer = payload;
})

export const setOpponent = action((state, payload) => {
    state.opponent = payload;
})

export const connect = thunk((actions) => {
    const socket = io();

    const shouldAwaitOtherPlayer = usersCountInRoom => {
        if (usersCountInRoom < MINIMUM_PAYERS_COUNT_TO_PLAY) {
            actions.setIsAwaitingOtherPlayer(true);
        } else {
            actions.setIsAwaitingOtherPlayer(false);
        }
    }

    socket.on('connect', () => {
        actions.setIsConnected(socket.connected)
    })

    socket.on('message', function (message) {
        console.log(message);
    })

    socket.on('roomId', (roomId, usersCountInRoom) => {
        actions.setRoomId(roomId);
        shouldAwaitOtherPlayer(usersCountInRoom);
    })

    socket.on('other_player_join', (otherId, otherUserName, usersCountInRoom) => {
        actions.setOpponent({ id: otherId, userName: otherUserName })
        shouldAwaitOtherPlayer(usersCountInRoom)
    })

    socket.on('error', error => {
        console.log(error) // todo: notify the user
    })

    actions.setSocket(socket);

})

export const createRoom = action((state, payload) => {
    const { roomName } = payload;
    const { userName } = state;
    if (state.socket)
        state.socket.emit('create_room', roomName, userName)
})

export const leaveRoom = action((state) => {
    const { roomId, socket } = state;
    if (socket && roomId)
        socket.emit('leave_room', roomId);
})

export const joinRoom = action((state, payload) => {
    const roomId = payload;
    const { socket, userName } = state;
    if (socket)
        socket.emit('join_room', roomId, userName);
})

export const onIsInsideRoomChange = actionOn(
    actions => [
        actions.leaveRoom,
        actions.setRoomId
    ],
    (state, target) => {
        const [leaveRoom, setRoomId] = target.resolvedTargets;
        switch (target.type) {
            case setRoomId:
                state.isInsideRoom = true;
                break;
            case leaveRoom:
                state.isInsideRoom = false;
                break;
            default:
                break;
        }
    })