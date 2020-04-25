import { useEffect } from 'react'
import { useStoreActions, useStoreState } from 'easy-peasy'

export function useCards() {
    // fixme: can only fetch cards if there is a valid session id and the user connected.
    const { fetchCards } = useStoreActions(actions => actions.cards)
    const { items } = useStoreState(state => state.cards)

    useEffect(() => {
        fetchCards()
    }, [fetchCards])

    return { items }
}

export function useReconnect() {
    const { connect } = useStoreActions(actions => actions.session)
    const { isConnected, socket } = useStoreState(state => state.session)

    useEffect(() => {

        if(!socket && isConnected){
            console.log('[useReconnect]', 'reconnecting')
            connect()
        }

        return () => {
            console.log('[useReconnect]', 'unmounted -> disconnecting')
            // todo: disconnect socket from server
        }
    }, [isConnected, connect, socket])
}