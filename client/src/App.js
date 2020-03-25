import React, { useState, useEffect } from 'react';
import Footer from './components/Footer'
import { useStoreState } from 'easy-peasy'
import CardsSection from './components/CardsSection'
import Moves from './components/Moves'
import GameOver from './components/GameOver'
import './App.scss'

import io from 'socket.io-client'
import Login from './components/Login';

export default function App() {
  const { isGameOver } = useStoreState(state => state.cards)
  
  const user = {isConnected: true} // TODO: clear mock

  if(!user.isConnected) return <Login />

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
  const [socket, setSocket] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [userName, setUserName] = useState('user_name')
  const [roomName, setRoomName] = useState('room_name')
  const [availableRooms, setAvailableRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState('')

  useEffect(() => {
    if (socket) {
      socket.once('connect', () => {
        console.log('client is connected', socket.connected)
      })

      socket.on('message', function (message) {
        console.log(message);
      })

      socket.on('roomId', roomId => {
        setRoomId(roomId);
      })
    }
  }, [socket])

  return (
    <>
      <button onClick={() => {
        fetch('/api/rooms', {
          headers: {
            "ContentType": "application/json"
          }
        })
          .then(res => res.json())
          .then(res => {
            console.log(res)
            setAvailableRooms(res.available)
          })
          .catch(err => console.log(err))
      }}>
        get rooms
    </button>
      <button onClick={() => { setSocket(io()) }}>
        Connect
      </button>
      <div>
        <input type="text" onChange={e => { e.preventDefault(); setUserName(e.target.value) }} value={userName} />
      </div>

      <div>
        <input type="text" onChange={e => { e.preventDefault(); setRoomName(e.target.value) }} value={roomName} />
        <button onClick={() => { socket.emit('create_room', roomName, userName) }}>
          create room
        </button>
      </div>

      <button onClick={() => { socket.emit('leave_room', roomId) }}>
        leave room
      </button>

      {availableRooms.length > 0 &&
        <div>
          <select onChange={e => { e.preventDefault(); setSelectedRoom(e.target.value) }} value={selectedRoom}>
            {availableRooms.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <button onClick={() => { socket.emit('join_room', selectedRoom, userName) }}>
            join room
          </button>
        </div>
      }

    </>
  );
}



