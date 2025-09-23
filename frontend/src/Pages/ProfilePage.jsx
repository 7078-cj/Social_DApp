import React, { useContext, useState } from 'react'
import ProfileView from '../Components/ProfileView'
import ContractContext from '../Contexts/Contracts'
import { useParams } from 'react-router-dom'

function ProfilePage() {
    const {profile, fetchProfile} = useContext(ContractContext)
    const {account} = useParams()
    const [otherAccount, setOtherAccount] = useState(null)

    if (account){
        let a = fetchProfile(account)
        setOtherAccount(a)
    }

    return (
        <div>
            <ProfileView profile={otherAccount ? otherAccount: profile}/>
        </div>
    )
}

export default ProfilePage