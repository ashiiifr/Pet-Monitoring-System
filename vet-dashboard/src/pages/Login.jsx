import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Stethoscope, ArrowRight, Lock, Mail, User } from 'lucide-react'

function Login({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            if (isRegistering) {
                await api.post('/auth/register', { email, password, name, role: 'vet' })
            }
            const res = await api.post('/auth/login', { email, password })
            onLogin(res.data.token, res.data.user)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
            <div className="w-full max-w-sm p-8">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-surfaceHighlight border border-border rounded-xl mx-auto flex items-center justify-center text-accent mb-6 shadow-sm">
                        <Stethoscope size={24} />
                    </div>
                    <h1 className="text-2xl font-semibold text-text-primary mb-2">VetPortal</h1>
                    <p className="text-sm text-text-tertiary">Professional Veterinary Workspace</p>
                </div>

                {error && (
                    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors placeholder:text-text-tertiary"
                                placeholder="Full Name"
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors placeholder:text-text-tertiary"
                            placeholder="name@clinic.com"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors placeholder:text-text-tertiary"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group text-sm"
                    >
                        {isRegistering ? 'Create Profile' : 'Sign In'}
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-text-secondary hover:text-text-primary text-xs transition-colors"
                    >
                        {isRegistering ? 'Have an account? Sign In' : 'New credential provisioning'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login
