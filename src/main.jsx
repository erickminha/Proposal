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
import PublicApplication from './PublicApplication.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/trabalhe-conosco" element={<CareersPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/candidatura" element={<PublicApplication />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
