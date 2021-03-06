import React from 'react'
import { useStoreActions } from 'easy-peasy'
import Button from '@material-ui/core/Button'

export default function GameOver() {

    const { playAgain } = useStoreActions(actions => actions.cards)
  
    const winningPlayer = 1;
  
    return <section className="game-over">
      <h3>
        Game Over
      </h3>
      <h4>
        Player {winningPlayer} won!
      </h4>
      <article>
        <Button color="primary" variant="contained" onClick={() => playAgain()}>
          Play Again?
        </Button>
      </article>
    </section>
  
  }