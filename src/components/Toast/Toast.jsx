import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import Slide from '@material-ui/core/Slide'
import Alert from '@material-ui/lab/Alert'
import { useStoreState } from 'easy-peasy'

function Toast() {

    const { isShowToast, toastText, isGood } = useStoreState(state => state.cards)

    return (
        <Snackbar open={isShowToast} TransitionComponent={Slide} anchorOrigin={{vertical: "top",  horizontal: "right"}}>
            <Alert severity={isGood ? "success" : "error"}>{toastText}</Alert>
        </Snackbar>
    )
}

export default React.memo(Toast);
