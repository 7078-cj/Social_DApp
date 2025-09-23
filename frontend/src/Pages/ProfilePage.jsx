import React, { useContext } from 'react'
import ProfileView from '../Components/ProfileView'
import ContractContext from '../Contexts/Contracts'

function ProfilePage() {
    const {profile} = useContext(ContractContext)

    return (
        <div>
            <ProfileView profile={profile}/>
        </div>
    )
}

export default ProfilePage