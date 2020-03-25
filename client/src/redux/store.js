import { createStore } from 'easy-peasy'
import * as cardsModel from './models/cardsModel'
import * as sessionModel from './models/sessionModel'

const model = {
    cards: {...cardsModel},
    session: {...sessionModel},
}

const store = createStore(model)

export default store;