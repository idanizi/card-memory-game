import React from 'react';
import Footer from './components/Footer'
import { useStoreActions, useStoreState } from 'easy-peasy'
import { useCards } from './hooks'
import './App.scss'
import _ from 'lodash'

export default function App() {
  const { isGameOver } = useStoreState(state => state.cards)

  // const isGameOver = false;
  return (
    <main>
      <header>TODO: header</header>
      {
        isGameOver
          ? <GameOver />
          : <CardsSection />
      }
      <Footer />
    </main>
  );
}

function GameOver() {

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
      <button onClick={() => playAgain()}>
        Play Again?
      </button>
    </article>
  </section>

}

function CardsSection() {
  console.log('render cards section')
  const { isShowToast, toastText, items, moves } = useStoreState(state => state.cards)

  const { fetchCards } = useStoreActions(actions => actions.cards)

  React.useEffect(() => {
    fetchCards()
  }, [fetchCards])

  return (
    <section className="cards">
      <article style={{ gridTemplate: `repeat(${Math.ceil(items.length ** 0.5)}, 1fr) / repeat(${Math.ceil(items.length ** 0.5)}, 1fr)` }}>
        {items.map((card, key) =>
          <Card {...card} key={key} />)}
      </article>
      <aside>
        <h5 style={{display:'grid', gap:"1em", gridTemplate: '1fr / 1fr 1fr'}}>
          <strong>moves:</strong>
          <span>{moves}</span>
        </h5>
        <h4>
          {isShowToast && <Toast text={toastText} />}
        </h4>
      </aside>
    </section>
  );
}

function Toast({ text }) {
  return <span>{text}</span>
}

const Card = React.memo(({ index, id, isUp, url, isActive }) => {
  console.log('render Card')
  const { flipCard } = useStoreActions(actions => actions.cards)
  const cover = '#';

  return (
    <button className="card"
      onClick={() => flipCard(index)} disabled={!isActive}>
      {isUp
        ? <img src={url} alt={id} />
        : cover}
    </button>
  )
})