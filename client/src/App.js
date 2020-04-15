import React from 'react';
import Footer from './components/Footer'
import { useStoreState } from 'easy-peasy'
import CardsSection from './components/CardsSection'
import Moves from './components/Moves'
import GameOver from './components/GameOver'
import './App.scss'
import Login from './components/Login';
import { useReconnect } from './hooks'

function App() {
  console.log('[App]', 'render')

  const isGameOver = useStoreState(state => state.cards.isGameOver)
  const isConnected = useStoreState(state => state.session.isConnected)
  const isInsideRoom = useStoreState(state => state.session.isInsideRoom)
  const isAwaitingOtherPlayer = useStoreState(state => state.session.isAwaitingOtherPlayer)

  useReconnect()

  if (!isConnected || !isInsideRoom || isAwaitingOtherPlayer) return <Login />

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

export default React.memo(App) // fixme: re-rendering unnecessary


