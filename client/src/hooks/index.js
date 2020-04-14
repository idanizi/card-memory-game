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