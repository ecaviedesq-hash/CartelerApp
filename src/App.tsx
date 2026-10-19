import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FallbackRedirect, GuestRoute, ProtectedRoute } from './components/RouteGuards.tsx'
import { Layout } from './components/Layout.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { appConfigurada } from './lib/config.ts'
import { DetailPage } from './pages/DetailPage.tsx'
import { ListPage } from './pages/ListPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import { SearchPage } from './pages/SearchPage.tsx'
import { SetupPage } from './pages/SetupPage.tsx'

export default function App() {
  if (!appConfigurada) return <SetupPage />

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<SearchPage />} />
              <Route path="/lista" element={<ListPage />} />
              <Route path="/lista/:id" element={<DetailPage />} />
            </Route>
          </Route>
          <Route path="*" element={<FallbackRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
