import { action, thunk, actionOn, thunkOn } from 'easy-peasy'
import { TOAST_TIMEOUT, CARDS_COUNT } from '../../constants'
import _ from 'lodash'
import { delay } from '../../util'

export let items = []
export let toastText = ''

export const tryFlipCard = thunk((actions, payload, { getStoreState, getStoreActions }) => {
    console.log('[tryFlipCard]', { payload })
    const { session: user = {} } = getStoreState();
    if (user.isMyTurn) {
        actions.flipCard(payload) // payload := card.id
        actions.bumpMoves()
        getStoreActions().session.notifyFlipCard(payload)
    } else {
        actions.showToast({ text: 'Wait for your turn.' })
    }
})

export const bumpMoves = action((state) => {
    console.log('[bumpMoves]')
    state.moves++;
})

export const setCardIsUp = action((state, payload) => {
    console.log('[setCardIsUp]', { payload })
    const { id, isUp } = payload;
    const card = state.items.find(x => x.id === id)
    card.isUp = isUp;
})

export const flipCard = thunk((actions, payload, { getState }) => {
    console.log('[flipCard]', { payload })
    const state = getState();

    if (state.items.filter(x => x.isActive && x.isUp).length >= 2) {
        return;
    }

    const id = payload;
    actions.setCardIsUp({ id, isUp: true });
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
    async (actions, target, { getState, getStoreActions, getStoreState }) => {
        console.log('[onFlipCard]')
        const state = getState();
        const cardId = target.payload;
        const card = state.items.find(x => x.id === cardId)

        const twinCard = state.items.find(x =>
            x !== card && x.id === card.id)

        const upCards = state.items.filter(x => x.isUp && x.isActive);

        if (upCards.length >= 2) {
            if (twinCard?.isUp && card.isUp) {
                actions.showToast({ text: `Found ${card.description}!`, isGood: true })
                await delay(TOAST_TIMEOUT / 2)
                actions.removeCards([card, twinCard])
            } else {
                actions.showToast({ text: `Aww... try again!`, isGood: false })
                await delay(TOAST_TIMEOUT * 0.7)
                actions.coverCards(upCards)

                if (getStoreState().session.isMyTurn) {
                    getStoreActions().session.turnEnd()
                }
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

export const fetchCards = thunk(async (actions, payload, { getStoreState }) => {
    let url = `/api/cards`
    const { session: user = {} } = getStoreState()

    if (user.isInsideRoom) {
        url += `?roomId=${user.roomId}`
    } else {
        console.log('[fetch cards] user is fetching cards outside of room')
    }

    const response = await fetch(url)
    if (response.ok) {
        const result = await response.json();
        actions.setCards(result)
    } else {
        console.log(
            `response is not ok ` +
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