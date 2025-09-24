import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ContractContext, { Contracts } from './Contexts/Contracts'
import Register from './Pages/Register'
import PrivateRoutes from './Contexts/PrivateRoutes'
import Home from './Pages/Home'
import ProfilePage from './Pages/ProfilePage'
import PublicRoutes from './Contexts/PublicRoutes'

function App() {
  

  return (
    <>
       <Router>
        <Contracts>
          <Routes>
            <Route element={<PublicRoutes />}>
            <Route path="/register" element={<Register />} />
          </Route>
              
            <Route element={<PrivateRoutes />} >
              <Route path="/" element={<Home />} />
              <Route path="/profile/:account" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
             
            </Route>
              
          </Routes>
        </Contracts>
      </Router>
    </>
  )
}

export default App
