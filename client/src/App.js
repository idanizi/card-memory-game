import React from 'react';
import Footer from './components/Footer'
import { useStoreState } from 'easy-peasy'
import CardsSection from './components/CardsSection'
import GameOver from './components/GameOver'
import './App.scss'
import Login from './components/Login';
import { useReconnect } from './hooks'

export default function App() {
  console.log('[App]', 'render')

  const isGameOver = useStoreState(state => state.cards.isGameOver)
  const isConnected = useStoreState(state => state.session.isConnected)
  const isInsideRoom = useStoreState(state => state.session.isInsideRoom)
  const isAwaitingOtherPlayer = useStoreState(state => state.session.isAwaitingOtherPlayer)

  useReconnect()

  return (
    (!isConnected || !isInsideRoom || isAwaitingOtherPlayer) ?
      <Login />
      :
      <main>
        {
          isGameOver
            ? <GameOver />
            : <CardsSection />
        }
        <Footer />
      </main>
  );
}

