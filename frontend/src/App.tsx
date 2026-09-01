import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { ContentProvider } from './content/ContentContext'
import { DetailPage } from './pages/DetailPage'
import { ListPage } from './pages/ListPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/n/:id"
              element={
                <ProtectedRoute>
                  <DetailPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ContentProvider>
    </AuthProvider>
  )
}
