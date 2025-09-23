import './App.css'
import ProfileForm from './Components/ProfileForm'
import ProfileView from './Components/ProfileView'
import CreatePostForm from './Components/CreatePostForm'
import PostsList from './Components/PostList'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ContractContext, { Contracts } from './Contexts/Contracts'
import Register from './Pages/Register'
import PrivateRoutes from './Contexts/PrivateRoutes'
import Home from './Pages/Home'

function App() {
  

  return (
    <>
       <Router>
        <Contracts>
          <Routes>
            <Route path="/register" element={<Register />} />
              
            <Route element={<PrivateRoutes />} >
              <Route path="/" element={<Home />} />
            </Route>
              
          </Routes>
        </Contracts>
      </Router>
    </>
  )
}

export default App
