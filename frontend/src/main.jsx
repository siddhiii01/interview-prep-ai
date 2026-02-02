import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TamboProvider} from "@tambo-ai/react"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TamboProvider  apiKey={import.meta.env.TAMBO_API_KEY}> 
        <App />
    </TamboProvider>
    
  </StrictMode>,
)
