import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import App from './App.jsx'
import AcceptInvite from './AcceptInvite.jsx'
import PublicHome from './PublicHome.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/portal" element={<App />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppHub />} />
          <Route path="/app/propostas/*" element={<App />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
