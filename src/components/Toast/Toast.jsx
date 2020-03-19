import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import Slide from '@material-ui/core/Slide'
import Alert from '@material-ui/lab/Alert'

function Toast({ text, isGood, open }) {

    return (
        <Snackbar open={open} TransitionComponent={Slide} anchorOrigin={{vertical: "top",  horizontal: "right"}}>
            <Alert severity={isGood ? "success" : "error"}>{text}</Alert>
        </Snackbar>
    )
}

export default React.memo(Toast);
