import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Outlet />
      </main>
    </>
  )
}