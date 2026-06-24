import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { ThemeProvider }   from './context/ThemeContext'
import AppLayout           from './components/AppLayout'
import ProtectedRoute      from './components/ProtectedRoute'
import LoginPage           from './pages/LoginPage'
import RegisterPage        from './pages/RegisterPage'
import CollectionPage      from './pages/CollectionPage'
import SearchPage          from './pages/SearchPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ProfilePage         from './pages/ProfilePage'
import SettingsPage        from './pages/SettingsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/collection"      element={<CollectionPage />} />
                <Route path="/search"          element={<SearchPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/profile"         element={<ProfilePage />} />
                <Route path="/settings"        element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}