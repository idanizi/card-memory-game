import { thunk, thunkOn, action, actionOn } from 'easy-peasy'
import _ from 'lodash'
import { getFunctionName } from '../../util'

export const userName = null;
export const roomId = null;
export const roomName = null;
export const availableRooms = [];
export const socket = null;

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
