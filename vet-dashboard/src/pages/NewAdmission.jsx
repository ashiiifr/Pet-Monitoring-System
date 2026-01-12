import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Save, Upload, User, FileText, Activity } from 'lucide-react'
import api from '../services/api'

export default function NewAdmission() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        breed: '',
        species: 'canine',
        age_years: '',
        weight_kg: '',
        owner_name: '',
        owner_contact: '',
        reason: ''
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Mock API call since backend might not have this endpoint fully wired for web yet
            // await api.post('/pets', formData) 
            await new Promise(resolve => setTimeout(resolve, 1000)) // Sim delay
            navigate('/patients')
        } catch (err) {
            console.error(err)
            alert('Failed to admit patient')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 min-h-screen bg-background text-text-primary animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/patients')}
                    className="p-2 hover:bg-surface rounded-full text-text-secondary hover:text-text-primary transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text-primary">New Admission</h1>
                    <p className="text-sm text-text-secondary">Register a new biological entity into the system</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Intake Form */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Info Card */}
                    <div className="bento-card p-6">
                        <div className="flex items-center gap-2 mb-6 text-accent">
                            <User size={20} />
                            <h3 className="font-medium">Subject Identity</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-mono text-text-tertiary mb-1.5 uppercase tracking-wider">Full Designation</label>
                                <input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                    placeholder="e.g. REX-01"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-text-tertiary mb-1.5 uppercase tracking-wider">Species</label>
                                <select
                                    name="species"
                                    value={formData.species}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none appearance-none"
                                >
                                    <option value="canine">Canine (Dog)</option>
                                    <option value="feline">Feline (Cat)</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-text-tertiary mb-1.5 uppercase tracking-wider">Breed / Variant</label>
                                <input
                                    name="breed"
                                    value={formData.breed}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none"
                                    placeholder="e.g. German Shepherd"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Biometrics Card */}
                    <div className="bento-card p-6">
                        <div className="flex items-center gap-2 mb-6 text-accent">
                            <Activity size={20} />
                            <h3 className="font-medium">Initial Biometrics</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-text-tertiary mb-1.5 uppercase tracking-wider">Age (Years)</label>
                                <input
                                    name="age_years"
                                    type="number"
                                    value={formData.age_years}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-text-tertiary mb-1.5 uppercase tracking-wider">Weight (kg)</label>
                                <input
                                    name="weight_kg"
                                    type="number"
                                    step="0.1"
                                    value={formData.weight_kg}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none"
                                    placeholder="0.0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Owner Info Card */}
                    <div className="bento-card p-6">
                        <div className="flex items-center gap-2 mb-6 text-accent">
                            <FileText size={20} />
                            <h3 className="font-medium">Guardian Information</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-text-tertiary mb-1.5 uppercase tracking-wider">Owner Name</label>
                                <input
                                    name="owner_name"
                                    value={formData.owner_name}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none"
                                    placeholder="Registered Guardian"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-text-tertiary mb-1.5 uppercase tracking-wider">Contact Link</label>
                                <input
                                    name="owner_contact"
                                    value={formData.owner_contact}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none"
                                    placeholder="Comms ID or Phone"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Status */}
                <div className="space-y-6">
                    <div className="bento-card p-6 sticky top-8">
                        <h3 className="font-medium text-text-primary mb-4">Admission Protocols</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-surfaceHighlight border border-border">
                                <div className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Subject will be assigned a temporary ID until collar pairing is confirmed.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-surfaceHighlight border border-border">
                                <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Initial scan is mandatory upon entry. Ensure isolation if bio-hazard detected.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                className="w-full py-2.5 border border-dashed border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload size={16} /> Upload Prior Records
                            </button>

                            <hr className="border-border my-2" />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                            >
                                {loading ? <span className="animate-spin">⏳</span> : <Save size={18} />}
                                {loading ? 'Processing...' : 'Confirm Admission'}
                            </button>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    )
}
