import React, { useEffect, useState } from 'react'
import { useStoreActions } from 'easy-peasy'

function Card({ index, id, isUp, url, isActive, description }) {
    const { flipCard } = useStoreActions(actions => actions.cards)
    const [className, setClassName] = useState('')

    useEffect(() => {
        let str = ''
        if (isUp) {
            str += 'flip-up'
            if (!isActive)
            str += ' disabled'
        } else {
            str = 'flip-down'
        }
        setClassName(str);
    }, [isUp, isActive])

    return (
        <div
            onClick={() => flipCard(index)}
            className={"card " + className}
        >
            {isUp &&
                <img src={url} alt={description} />
                }
        </div>
    )
}

export default React.memo(Card)