import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CollectionPage from './pages/CollectionPage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AppLayout />}>
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}