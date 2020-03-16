import { createStore } from 'easy-peasy'
import cardsModel from './models/cardsModel'

const model = {
    cards: cardsModel,
}

const store = createStore(model)

export default store;