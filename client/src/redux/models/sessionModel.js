import { thunk, thunkOn, action, actionOn } from 'easy-peasy'
import _ from 'lodash'
import io from 'socket.io-client'
import { v4 as uuid } from 'uuid'

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
export const isMyTurn = false;
export const sessionId = '';
export const userId = '';

export const setSessionId = action((state, payload) => {
    console.log('[setSessionId]', { payload })
    state.sessionId = payload;
})

export const setUserId = action((state, payload) => {
    state.userId = payload;
})


export const setIsMyTurn = action((state, payload) => {
    state.isMyTurn = payload;
})

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

export const notifyFlipCard = action((state, payload) => {
    const { socket, roomId } = state;
    const cardIndex = payload;
    if (socket && roomId) {
        socket.emit('flip_card', roomId, cardIndex)
    }
})

export const turnEnd = action((state) => {
    console.log('turnEnd')
    state.isMyTurn = false;
})

export const onTurnEnd = actionOn(actions => actions.turnEnd, (state) => {
    console.log('notifyTurnEnd')
    const { socket, roomId } = state;
    if (socket && roomId) {
        socket.emit('turn_end', roomId)
    }
})

async function createNewUser(name, sessionId) {
    try {
        const request = await fetch(`/api/user`, {
            method: "post",
            body: {
                name,
                sessionId,
            }
        })

        if (request.ok) {
            const userId = (await request.json())?.userId
            console.log('[createNewUser]', { userId })
            return userId;
        }

        console.log('[createNewUser] error: user not created.', { request })
    } catch (error) {
        console.log('[createNewUser]', error)
    }
}

async function updateUserSessionId(userId, sessionId) {
    try {
        const request = await fetch(`/api/user/${userId}`, {
            method: "patch",
            body: {
                sessionId,
            }
        })

        if (request.ok) {
            console.log('[updateUserSessionId]', { userId, sessionId })
            return;
        }

        console.log('[updateUserSessionId] failed', { request })
    } catch (error) {
        console.log('[updateUserSessionId]', error)
    }
}

async function isSessionIdValid(sessionId) {
    // todo: isSessionIdValid - fetch user by session id and check if response ok
    return true;
}

async function isUserIdValid(userId) {
    // todo: isUserIdValid
    return true;
}

async function getUserIdBySessionId(sessionId) {
    // todo: getUserIdBySessionId
    return "";
}

export const connect = thunk(async (actions, payload, { getStoreActions, getState }) => {
    console.log('[connect] start')

    if (_.isEmpty(getState().sessionId)) {
        actions.setSessionId(uuid())

        if (_.isEmpty(getState().userId)) {
            console.log('[connect]', 'no sessionId and no userId === first time login')
            const userId = await createNewUser(getState().userName, getState().sessionId)
            actions.setUserId(userId) // todo: persist userId to cookie
        }
        else {
            console.log("[connect]", "no sessionId and userId existed, needs to update new sessionId")
            await updateUserSessionId(getState().userId, getState().sessionId)
        }
    }

    else {
        console.log("[connect]", "session id exists on client side - we need to check it")

        if (isSessionIdValid(getState().sessionId)) {
            if (_.isEmpty(getState().userId)) {
                console.log("[connect]", "sessionId is valid but no userId")
                const userId = getUserIdBySessionId(getState().sessionId)
                setUserId(userId)
            }
            else {
                console.log("[connect]", "sessionId & userId valid, all good.")
            }
        }

        else {
            if (_.isEmpty(getState().userId)) {
                console.log("[connect]", "session is invalid & userId is empty -> disconnect the user")
                actions.setSessionId('')
                actions.setIsConnected(false)
            }
            else {
                actions.setSessionId(uuid())

                if (isUserIdValid(getState().userId)) {
                    console.log("[connect]", "userId valid but sessionId was invalid -> update sessionId")
                    updateUserSessionId(getState().userId, getState().sessionId)
                }
                else {
                    console.log("[connect]", "sessionId & userId are invalid -> disconnect the user")
                    actions.setUserId('')
                    actions.setSessionId('')
                    actions.setIsConnected(false)
                }
            }
        }
    }


    const socket = io()

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

    socket.on('other_player_flip_card', (otherPlayerUserName, cardIndex) => {
        console.log(`[other_player_flip_card]`, { otherPlayerUserName, cardIndex })
        getStoreActions().cards.flipCard(cardIndex)
    })

    socket.on('error', error => {
        console.log(error) // todo: notify the user
    })

    socket.on('turn_change', (isMyTurn) => {
        console.log(`[turn_change]`, { isMyTurn });
        actions.setIsMyTurn(isMyTurn);
    })

    actions.setSocket(socket);

})

export const createRoom = action((state, payload) => {
    const roomName = payload;
    const { userId } = state;
    if (state.socket)
        state.socket.emit('create_room', roomName, userId)
})

export const leaveRoom = action((state) => {
    const { roomId, socket } = state;
    if (socket && roomId)
        socket.emit('leave_room', roomId);
})

export const joinRoom = action((state, payload) => {
    const roomId = payload;
    const { socket, userId } = state;
    if (socket)
        socket.emit('join_room', roomId, userId);
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