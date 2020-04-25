import React from 'react'
import { useStoreState } from 'easy-peasy'
import { User } from '../img';

function UserInfo() {
    const { userName } = useStoreState(state => state.session)

    return (
        <div className="info user">
            <User />
            <h3>User</h3>
            <h4>{userName}</h4>
            <p>{"03:00"}</p> {/* todo: user timeout */}
        </div>
    );
}

export default React.memo(UserInfo)

