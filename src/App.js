import React from 'react';
import Footer from './components/Footer'
import { useStoreActions, useStoreState } from 'easy-peasy'
import { useCards } from './hooks'
import './App.scss'

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

  const winningPlayer = 1;

  return <section className="game-over">
    <h3>
      Game Over
    </h3>
    <h4>
      Player {winningPlayer} won!
    </h4>
    <article>
      <button>
        Play Again?
      </button>
    </article>
  </section>

}

function CardsSection() {
  const { cards } = useCards()
  const { isShowToast, toastText } = useStoreState(state => state.cards)

  const Cards = () =>
    cards.map((props, key) => <Card {...props} key={key} />)

  return (
    <section className="cards">
      <article>
        <Cards />
      </article>
      <aside>
        {isShowToast && <Toast text={toastText} />}
      </aside>
    </section>
  );
}

function Toast({ text }) {
  return <span>{text}</span>
}

function Card({ index, id, isUp }) {
  const { flipCard } = useStoreActions(actions => actions.cards)
  const cover = '#';

  return (
    <button className="card"
      onClick={() => flipCard(index)}>
      {isUp ? id : cover}
    </button>
  )
}