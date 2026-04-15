import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
        <Route path="/trabalhe-conosco" element={<CareersPublic />} />
        <Route path="/vagas" element={<CareersPublic />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
