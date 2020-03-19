import React from 'react';
import Footer from './components/Footer'
import {useStoreState } from 'easy-peasy'
import { useCards } from './hooks'
import Toast from './components/Toast'
import Card from './components/Card'
import GameOver from './components/GameOver'
import './App.scss'

export default function App() {
  const { isGameOver } = useStoreState(state => state.cards)

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

function CardsSection() {
  const { isShowToast, toastText, moves, isGood } = useStoreState(state => state.cards)
  const { items } = useCards()

  return (
    <section className="cards">
      <article style={{
        gridTemplate: `repeat(${Math.ceil(items.length ** 0.5)}, 1fr) / repeat(${Math.ceil(items.length ** 0.5)}, 1fr)`,
        justifyItems:'center'
      }}>
        {items.map((card, key) =>
          <Card {...card} key={key} />)}
      </article>
      <aside>
        <h5 style={{ display: 'grid', gap: "1em", gridTemplate: '1fr / 1fr 1fr' }}>
          <strong>moves:</strong>
          <span>{moves}</span>
        </h5>
        <Toast open={isShowToast} text={toastText} isGood={isGood} />
      </aside>
    </section>
  );
}

