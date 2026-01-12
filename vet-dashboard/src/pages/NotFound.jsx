import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-primary p-4 animate-fade-in text-center">
            <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-6">
                <AlertTriangle size={48} />
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
            <h2 className="text-xl font-semibold mb-4">Signal Lost</h2>

            <p className="text-text-secondary max-w-md mx-auto mb-8">
                The requested frequency does not exist. The coordinate you are trying to reach is outside the operational grid.
            </p>

            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                <Home size={18} /> Return to Mission Control
            </Link>
        </div>
    )
}
