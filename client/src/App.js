import React, { useState, useEffect } from 'react';
import Footer from './components/Footer'
import { useStoreState, useStoreActions } from 'easy-peasy'
import CardsSection from './components/CardsSection'
import Moves from './components/Moves'
import GameOver from './components/GameOver'
import './App.scss'
import Login from './components/Login';

export default function App() {
  const { isGameOver } = useStoreState(state => state.cards)
  const user = useStoreState(state => state.session)

  if (!user.isConnected || !user.isInsideRoom || user.isAwaitingOtherPlayer) return <Login />

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
      {/* <SocketTest /> */}
      <Footer />
    </main>
  );
}



