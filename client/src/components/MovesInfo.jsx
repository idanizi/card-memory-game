import React from 'react'
import { useStoreState } from 'easy-peasy'
import { Foots } from '../img';

function MovesInfo() {
    const { moves } = useStoreState(state => state.cards)

    return (
        <div className="info moves">
            <Foots />
            <h3>Moves</h3>
            <p>{moves}</p>
        </div>
    );
}

export default React.memo(MovesInfo)

