import { action, thunk, actionOn, thunkOn } from 'easy-peasy'
import { TOAST_TIMEOUT, CARDS_COUNT } from '../../constants'
import _ from 'lodash'

export let items = []
export let toastText = '' 

export const flipCard = action((state, payload) => {
    const index = payload;
    const card = state.items.find(x => x.index === index)
    card.isUp = true;
    return {...state, items: [...state.items]}
})

export const removeCards = action((state, payload) => {
    const cardsToRemove = payload;
    _.remove(state.items, x => cardsToRemove.map(c => c.index).includes(x.index))
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

export const coverCards = action((state, payload) => {
    const cardsToCover = payload;
    cardsToCover.forEach(card => card.isUp = false)
})

export const onFlipCard = thunkOn(
    actions => actions.flipCard,
    async (actions, target, { getState }) => {
        const state = getState();
        const index = target.payload;
        const card = state.items.find(x => x.index === index)

        const twinCard = state.items.find(x =>
            x !== card && x.id === card.id)

        const upCards = state.items.filter(x => x.isUp);

        if (upCards.length >= 2) {
            if (twinCard?.isUp && card.isUp) {
                actions.showToast(`Found ${card.id}!`)
                await delay(TOAST_TIMEOUT / 2)
                actions.removeCards([card, twinCard])
            } else {
                actions.showToast(`Aww... try again!`)
                await delay(TOAST_TIMEOUT * 0.7)
                actions.coverCards(upCards)
            }
        }
        return;
    })

class Card {
    constructor(id, index, url) {
        this.isUp = false;
        this.id = id;
        this.index = index;
        this.url = url;
    }
}

export const fetchCards = thunk(async (actions, payload) => {
    const response = await fetch(
        `https://api.unsplash.com/photos/`
        + `?client_id=${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`
        + `&per_page=${CARDS_COUNT}`)
    if (response.ok) {
        const result = (await response.json()).map((photo, index) => new Card(photo.id, index, photo.urls.small))
        actions.setCards(result)
    } else {
        console.log(
            `response is not ok` +
            `status: ${response.status} ${response.text}`)
    }
})

export const setCards = action((state, payload) => {
    state.items = payload;
})

export const checkIfGameIsOver = actionOn(
    actions => actions.removeCards,
    state => {
        if (state.items.length === 0)
            state.isGameOver = true;
    }
)

export const resetGame = action(state => {
    state.isGameOver = false;
})

export const playAgain = thunk(actions => {
    actions.resetGame()
    actions.fetchCards()
})

export let loading = false;

export const onLoading = actionOn(
    actions => [
        actions.fetchCards.startType,
        actions.fetchCards.type
    ],
    (state, target) => {
        const [start, end] = target.resolvedTargets;
        switch (target.type) {
            case start:
                state.loading = true;
                break;
            case end:
                state.loading = false;
                break;
            default: break;
        }
    }
)

export let isGameOver = false;
export let isShowToast = false;

export default {
    isGameOver, isShowToast, checkIfGameIsOver,
    clearToast, coverCards, fetchCards, flipCard, items,
    loading, onLoading, onShowToast, playAgain, removeCards,
    resetGame, setCards, showToast, toastText, onFlipCard,
}