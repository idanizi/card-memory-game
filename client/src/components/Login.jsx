import React from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import './Login.scss'
import Footer from './Footer'

export default function Login() {
    return (
        <main className="login">
            <section>
                <article>
                    <header>
                        <h1>Card Memory Game</h1>
                    </header>
                    <TextField className="input-text" label={"User Name"} variant="outlined" />
                    <Button className="submit-button" variant="contained" color="primary">Enter</Button>
                </article>
            </section>
            <Footer />
        </main>
    )
}
