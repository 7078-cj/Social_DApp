import React from 'react'
import PostsList from '../Components/PostList'
import CreatePostForm from '../Components/CreatePostForm'

function Home() {
  return (
    <div>
        <CreatePostForm/>
        <PostsList/>
    </div>
  )
}

export default Home