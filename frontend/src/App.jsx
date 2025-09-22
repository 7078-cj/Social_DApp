import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProfileForm from './Components/ProfileForm'
import ProfileView from './Components/ProfileView'
import CreatePostForm from './Components/CreatePostForm'
import PostsList from './Components/PostList'

function App() {
  

  return (
    <>
      <ProfileForm/>
      <ProfileView/>
      <CreatePostForm/>
      <PostsList/>
    </>
  )
}

export default App
