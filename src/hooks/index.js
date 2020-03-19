import { useEffect } from 'react'
import { useStoreActions, useStoreState } from 'easy-peasy'

export function useCards() {
    const { fetchCards } = useStoreActions(actions => actions.cards)
    const { items } = useStoreState(state => state.cards)

    useEffect(() => {
        fetchCards()
    }, [fetchCards])

    return { items }
}