import React, { useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Popper from '@material-ui/core/Popper'
import './Login.scss'
import Footer from '../Footer'
import { useStoreActions, useStoreState } from 'easy-peasy'
import { v4 as uuid } from 'uuid'

function UserNameInput() {
    const { userName, } = useStoreState(state => state.session)
    const { setUserName, connect } = useStoreActions(actions => actions.session)

    const handleChangeUserName = e => {
        e.preventDefault()
        setUserName(e.target.value)
    }

    const handleEnter = e => {
        e.preventDefault()
        connect();
    }

    return (
        <article className="user-name-input">
            <TextField className="text-input" label={"User Name"} variant="outlined"
                value={userName}
                onChange={handleChangeUserName}
                onKeyUp={e => e.keyCode === 13 && handleEnter(e)} />
            <Button className="btn submit-button" variant="contained" color="primary"
                onClick={handleEnter}>
                Enter
            </Button>
        </article>
    )
}

function CopyNotificationPopper({ anchorEl }) {
    const open = Boolean(anchorEl);
    const Arrow = () => <div></div>
    return (
        <Popper open={open} anchorEl={anchorEl} modifiers={{}}>
            <div style={{backgroundColor: "#555", border:"1px solid #222", color: "#fff", padding:"0.5em"}}>copied!</div>
        </Popper>
    )
}

function InviteSection() {
    const [requiredRoomId] = window.location.pathname.match(/[^\/]+/g) || [];

    const user = useStoreState(state => state.session)
    const { joinRoom, createRoom } = useStoreActions(actions => actions.session)

    const ref = React.useRef(null)

    React.useEffect(() => {
        if (!user.isInsideRoom) {
            const roomName = uuid()
            createRoom(roomName)
            console.log({ roomName })
        }
    }, [user.isInsideRoom])

    if (requiredRoomId && user.isConnected && !user.isInsideRoom) {
        joinRoom(requiredRoomId);
        return <div className="spinner">Joining Room...</div> // todo: spinner
    }

    const handleInvite = () => {
        const text = window.location.href + user.roomId;
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('copied!', { text })
            })
            .catch(error => {
                console.log(error)
            })
    }

    return (
        <article className="invite">
            <Button ref={ref} className="btn invite" variant="contained" color="primary"
                onClick={handleInvite}>
                Invite
            </Button>
            <CopyNotificationPopper anchorEl={ref.current} />
        </article>
    )
}

export default function Login() {

    const user = useStoreState(state => state.session)

    return (
        <main className="login">
            <section>
                <header>
                    <h1>Card Memory Game</h1>
                </header>
                {user.isConnected ?
                    <InviteSection />
                    :
                    <UserNameInput />
                }
            </section>
            <Footer />
        </main>
    )
}
