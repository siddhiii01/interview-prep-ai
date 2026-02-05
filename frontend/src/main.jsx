import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { TamboProvider} from "@tambo-ai/react"

createRoot(document.getElementById('root')).render(
    <TamboProvider apiKey={import.meta.env.VITE_TAMBO_API_KEY}  generateThreadName={false}> 
        <App />
    </TamboProvider>
)
