import React, { useContext, useEffect } from 'react'
import ProfileForm from '../Components/ProfileForm'
import { Contract } from 'ethers'
import ContractContext from '../Contexts/Contracts'
import { useNavigate } from 'react-router-dom'

function Register() {
    return (
        <div>
            <ProfileForm/>
        </div>
    )
}

export default Register