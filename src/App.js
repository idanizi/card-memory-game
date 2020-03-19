import React from 'react';
import Footer from './components/Footer'
import { useStoreState } from 'easy-peasy'
import CardsSection from './components/CardsSection'
import Moves from './components/Moves'
import GameOver from './components/GameOver'
import './App.scss'

export default function App() {
  const { isGameOver } = useStoreState(state => state.cards)
  
  return (
    <main>
      <header>
        <Moves />
      </header>
      {
        isGameOver
          ? <GameOver />
          : <CardsSection />
      }
      <Footer />
    </main>
  );
}



