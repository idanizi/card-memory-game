import React, { useState, useEffect } from 'react';
import Footer from './components/Footer'
import { useStoreState, useStoreActions } from 'easy-peasy'
import CardsSection from './components/CardsSection'
import Moves from './components/Moves'
import GameOver from './components/GameOver'
import './App.scss'

import io from 'socket.io-client'
import Login from './components/Login';

export default function App() {
  const { isGameOver } = useStoreState(state => state.cards)

  const user = { isConnected: true } // TODO: clear mock

  if (!user.isConnected) return <Login />

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
      <SocketTest />
      <Footer />
    </main>
  );
}

function SocketTest() {
  const { roomId, userName, roomName, availableRooms } = useStoreState(state => state.session)
  const { fetchAvailableRooms, connect, setUserName, setRoomName, createRoom, joinRoom, leaveRoom } = useStoreActions(actions => actions.session)

  const [selectedRoom, setSelectedRoom] = useState('')

  return (
    <>
      <button onClick={() => { fetchAvailableRooms() }}>
        get rooms
    </button>
      <button onClick={() => { connect() }}>
        Connect
      </button>
      <div>
        <input type="text" onChange={e => { e.preventDefault(); setUserName(e.target.value) }} value={userName} />
      </div>

      <div>
        <input type="text" onChange={e => { e.preventDefault(); setRoomName(e.target.value) }} value={roomName} />
        <button onClick={() => { createRoom({ roomName, userName }) }}>
          create room
        </button>
      </div>

      <button onClick={() => { leaveRoom(roomId) }}>
        leave room
      </button>

      {availableRooms.length > 0 &&
        <div>
          <select onChange={e => { e.preventDefault(); setSelectedRoom(e.target.value) }} value={selectedRoom}>
            {availableRooms.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <button onClick={() => { joinRoom(selectedRoom) }}>
            join room
          </button>
        </div>
      }

    </>
  );
}



