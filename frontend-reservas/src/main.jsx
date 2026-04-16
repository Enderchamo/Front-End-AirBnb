import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './Context/AuthContext.jsx' // 👈 Verifica esta ruta

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* 👈 El Cerebro DEBE envolver a App */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)