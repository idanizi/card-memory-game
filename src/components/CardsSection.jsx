import React from 'react'
import { useCards } from '../hooks'
import Toast from './Toast'
import Card from './Card'

export default function CardsSection() {
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
        <Toast />
      </section>
    );
  }