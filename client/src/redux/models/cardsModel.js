import { action, thunk, actionOn, thunkOn } from 'easy-peasy'
import { TOAST_TIMEOUT, CARDS_COUNT } from '../../constants'
import _ from 'lodash'

export let items = []
export let toastText = ''

export const flipCard = action((state, payload) => {
    if (state.items.filter(x => x.isActive && x.isUp).length >= 2)
        return;

    state.moves++;

    const index = payload;
    const card = state.items.find(x => x.index === index)
    card.isUp = true;

    return { ...state, items: [...state.items] }
})

export const removeCards = action((state, payload) => {
    const cardsToRemove = payload;
    cardsToRemove.forEach(card => card.isActive = false)
})

export const showToast = action((state, payload) => {
    state.isShowToast = true;
    state.toastText = payload.text;
    state.isGood = payload.isGood;
})

export const clearToast = action(state => {
    state.isShowToast = false;
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

        const upCards = state.items.filter(x => x.isUp && x.isActive);

        if (upCards.length >= 2) {
            if (twinCard?.isUp && card.isUp) {
                actions.showToast({text: `Found ${card.description}!`, isGood: true})
                await delay(TOAST_TIMEOUT / 2)
                actions.removeCards([card, twinCard])
            } else {
                actions.showToast({text: `Aww... try again!`, isGood: false})
                await delay(TOAST_TIMEOUT * 0.7)
                actions.coverCards(upCards)
            }
        }
    })

class Card {
    constructor(id, index, url, description) {
        this.isUp = false;
        this.id = id;
        this.index = index;
        this.url = url;
        this.isActive = true;
        this.description = description;
    }
}

export const fetchCards = thunk(async (actions, payload) => {
    const response = await fetch(
        `https://api.unsplash.com/photos/`
        + `?client_id=${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`
        + `&per_page=${CARDS_COUNT / 2}`)
    if (response.ok) {

        const result = await response.json()
        let cards = result.map((photo, index) => new Card(photo.id, index, photo.urls.small, photo.alt_description))
        cards = [...cards, ...result.map((photo, index) => new Card(photo.id, index + cards.length, photo.urls.small, photo.alt_description))]
        cards = _.shuffle(cards)
        actions.setCards(cards)
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
        if (state.items.filter(x => x.isActive).length === 0)
            state.isGameOver = true;
    }
)

export const resetGame = action(state => {
    state.isGameOver = false;
    state.items = [];
    state.moves = 0;
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
export let moves = 0;