import { useEffect } from 'react'
import { useStoreActions, useStoreState } from 'easy-peasy'

export function useCards() {
    const { fetchCards } = useStoreActions(actions => actions.cards)
    const { cards } = useStoreState(state => state.cards)

    useEffect(() => {
        fetchCards()
    }, [fetchCards])

    return { cards }
}