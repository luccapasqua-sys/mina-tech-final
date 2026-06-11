import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Home from './pages/Home.jsx';
import Oscs from './pages/Oscs.jsx';
import Inscricao from './pages/Inscricao.jsx';
import Programacao from './pages/Programacao.jsx';
import Faq from './pages/Faq.jsx';
import Doacao from './pages/Doacao.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ProtectedRoute from './pages/admin/ProtectedRoute.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Site público */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/oscs" element={<Oscs />} />
          <Route path="/inscricao" element={<Inscricao />} />
          <Route path="/programacao" element={<Programacao />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/doacao" element={<Doacao />} />
        </Route>

        {/* Painel administrativo */}
        <Route path="/admin" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
