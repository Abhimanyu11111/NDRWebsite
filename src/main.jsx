import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import './index.css'
import App from './App.jsx'

// Auth now lives entirely in an httpOnly cookie — these localStorage keys
// were used by an older build and are never written by current code, but
// browsers that logged in before this migration still carry the leftover
// JWT/profile data indefinitely since nothing clears it without a logout.
["token", "refreshToken", "admin", "user"].forEach((key) =>
  localStorage.removeItem(key)
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
