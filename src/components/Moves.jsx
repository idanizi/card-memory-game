import React from 'react'
import { useStoreState } from 'easy-peasy'

function Moves() {
    const { moves } = useStoreState(state => state.cards)

    return (
        <h5 style={{ display: 'grid', gap: "1em", gridTemplate: '1fr / 1fr 1fr 1fr', justifyItems: 'center' }}>
            <span>🏃🏻‍♂️</span><span> Moves:</span>
            <span>{moves}</span>
        </h5>
    );
}

export default React.memo(Moves)

