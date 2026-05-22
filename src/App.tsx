import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Dashboard from './pages/Dashboard'
import MinhaConta from './pages/MinhaConta'
import PsicologoPublico from './pages/PsicologoPublico'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/minha-conta" element={<MinhaConta />} />
          <Route path="/p/:slug" element={<PsicologoPublico />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}
