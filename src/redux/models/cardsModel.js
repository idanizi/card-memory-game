import { action, thunk, actionOn, thunkOn } from 'easy-peasy'
import { CARDS_COUNT, TOAST_TIMEOUT } from '../../constants'
import _ from 'lodash'

export const cards = []

export const flipCard = action((state, payload) => {
    const index = payload;
    const card = state.cards.find(x => x.index === index)
    card.isUp = !card.isUp;
})

export const removeCards = action((state, payload) => {
    const cardsToRemove = payload;
    _.remove(state.cards, x => cardsToRemove.map(c => c.index).includes(x.index))
})

export const showToast = action((state, payload) => {
    state.isShowToast = true;
    state.toastText = payload;
})

export const clearToast = action(state => {
    state.isShowToast = false;
    state.toastText = '';
})

const delay = timeout =>
    new Promise(resolve => setTimeout(() => {
        resolve()
    }, timeout))

export const onShowToast = thunkOn(
    actions => actions.showToast,
    async (actions) => {
        await delay(TOAST_TIMEOUT);
        actions.clearToast();
    }
)

export const onFlipCard = thunkOn(
    actions => actions.flipCard,
    async (actions, target, { getState }) => {
        const state = getState();
        const index = target.payload;
        const card = state.cards.find(x => x.index === index)
        const twinCard = state.cards.find(x =>
            x !== card && x.id === card.id)
        if (twinCard?.isUp && card.isUp) {
            actions.showToast(`Found ${card.id}!`)
            await delay(TOAST_TIMEOUT / 2)
            actions.removeCards([card, twinCard])
        }
    })

export const fetchCards = thunk(async (actions, payload) => {
    // todo: fetch cards
    const keys = Array(CARDS_COUNT)
        .fill(0)
        .map((x, i) => i % Math.floor(CARDS_COUNT / 2))

    const result = Array(CARDS_COUNT)
        .fill(0)
        .map((x, i) => ({
            index: i,
            id: keys.splice(_.random(keys.length - 1), 1)[0],
            isUp: false,
        }))

    actions.setCards(result)
})

export const setCards = action((state, payload) => {
    state.cards = payload;
})

export const checkIfGameIsOver = actionOn(
    actions => actions.removeCards,
    state => {
        if(state.cards.length === 0)
            state.isGameOver = true;
    }
)

export const playAgain = thunk(actions => {

})

export let isGameOver = false;
export let isShowToast = false;