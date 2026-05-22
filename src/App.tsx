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
import PacientesDoMedico from './pages/PacientesDoMedico'
import './index.css'

function WithLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar />{children}<Footer /></>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas com navbar/footer */}
          <Route path="/" element={<WithLayout><Home /></WithLayout>} />
          <Route path="/login" element={<WithLayout><Login /></WithLayout>} />
          <Route path="/cadastro" element={<WithLayout><Cadastro /></WithLayout>} />
          <Route path="/minha-conta" element={<WithLayout><MinhaConta /></WithLayout>} />

          {/* Área do médico — sem navbar global */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />

          {/* Páginas do médico — sem navbar global */}
          <Route path="/p/:slug" element={<PsicologoPublico />} />
          <Route path="/p/:slug/pacientes" element={<PacientesDoMedico />} />
          <Route path="/p/:slug/entrar" element={<PacientesDoMedico />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
