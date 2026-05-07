import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#15151E',
          color: '#fff',
          border: '1px solid #38383F',
        },
        success: { iconTheme: { primary: '#E10600', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
)