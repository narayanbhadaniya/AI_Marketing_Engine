import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster position="top-right" toastOptions={{
      duration: 3000,
      style: { background: '#fff', color: '#111827', border: '1.5px solid #e5e7eb', fontSize: '13px', fontWeight: 500, borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
      success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
      error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
    }} />
  </BrowserRouter>
)
