import React, { useState, useRef } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Tooltip from 'react-bootstrap/Tooltip'
import Overlay from 'react-bootstrap/Overlay'
import Spinner from 'react-bootstrap/Spinner'
import './Login.scss'
import Footer from '../Footer'
import { useStoreActions, useStoreState } from 'easy-peasy'
import { v4 as uuid } from 'uuid'
import { delay } from '../../util'

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

function CopyButtonWithNotificationPopper({ onClick }) {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const timeout = 2e3;

    const handleClick = async () => {
        onClick()
        setShow(true)
        await delay(timeout)
        setShow(false)
    }

    return (
        <>
            <Button
                className="btn invite" variant="contained" color="primary"
                ref={target} onClick={handleClick}>
                Invite
            </Button>
            <Overlay target={target.current} show={show} placement="right">
                {(props) => (
                    <Tooltip id="overlay-example" {...props}>
                        Copied!
                    </Tooltip>
                )}
            </Overlay>
        </>
    );
}


function InviteSection() {
    const [requiredRoomId] = window.location.pathname.match(/[^\/]+/g) || [];

    const user = useStoreState(state => state.session)
    const { joinRoom, createRoom } = useStoreActions(actions => actions.session)

    const [joining, setJoining] = useState(false)

    React.useEffect(() => {
        if (!user.isInsideRoom && !requiredRoomId) {
            const roomName = uuid()
            createRoom(roomName)
        }
    }, [user.isInsideRoom])

    React.useEffect(() => {
        if (requiredRoomId && user.isConnected && !user.isInsideRoom) {
            setJoining(true);
            joinRoom(requiredRoomId);
        }
    })

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
            {joining ?
                <Spinner animation="border" />
                :
                <CopyButtonWithNotificationPopper onClick={handleInvite} />
            }
        </article>
    )
}

export default function Login() {

    const isConnected = useStoreState(state => state.session.isConnected)

    return (
        <main className="login">
            <section>
                <header>
                    <h1>Card Memory Game</h1>
                </header>
                {isConnected ?
                    <InviteSection />
                    :
                    <UserNameInput />
                }
            </section>
            <Footer />
        </main>
    )
}
