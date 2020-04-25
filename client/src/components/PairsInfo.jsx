import React from 'react'
import { useStoreState } from 'easy-peasy'
import { Pairs } from '../img';

function PairsInfo() {
    const { pairs } = useStoreState(state => state.cards)

    return (
        <div className="info pairs">
            <Pairs />
            <h3>Pairs</h3>
            <p>{pairs}</p>
        </div>
    );
}

export default React.memo(PairsInfo)

