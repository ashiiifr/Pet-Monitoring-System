import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Search, UserPlus, Filter, Dog, Cat, ChevronRight, Activity } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

function Patients() {
    const [patients, setPatients] = useState([])
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/vet/patients')
                setPatients(res.data)
            } catch (err) {
                console.error(err)
            }
        }
        fetchPatients()
    }, [])

    const filtered = patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.breed?.toLowerCase().includes(search.toLowerCase())

        if (!matchesSearch) return false
        if (filter === 'all') return true

        // Mock status logic if field missing (randomize based on ID parity for demo)
        const status = p.status || (p.id % 3 === 0 ? 'critical' : 'stable')
        return status === filter
    })

    const getRandomData = () => Array.from({ length: 10 }, () => ({ val: 60 + Math.random() * 40 }))

    return (
        <div className="p-8 min-h-screen bg-background text-text-primary font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1">Patient Registry</h1>
                    <p className="text-sm text-text-secondary">{patients.length} total records</p>
                </div>
                <Link to="/patients/new" className="btn-primary flex items-center gap-2">
                    <UserPlus size={16} /> New Admission
                </Link>
            </div>

            <div className="bento-card p-4 flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search by name or breed..."
                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-text-tertiary" />
                    <div className="flex bg-surface rounded-lg p-1 border border-border">
                        {['all', 'critical', 'stable'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${filter === f
                                    ? 'bg-surfaceHighlight text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(patient => (
                    <Link to={`/patients/${patient.id}`} key={patient.id} className="bento-card group flex items-center gap-4 hover:border-accent/40">
                        <div className="w-12 h-12 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-text-secondary group-hover:text-text-primary transition-colors">
                            {patient.pet_type === 'dog' ? <Dog size={20} /> : <Cat size={20} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-text-primary truncate flex items-center gap-2">
                                {patient.name}
                                {(patient.id % 3 === 0) && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Critical"></span>}
                            </h3>
                            <p className="text-xs text-text-tertiary truncate">{patient.breed} • {patient.age_years}y</p>
                        </div>

                        {/* Sparkline */}
                        <div className="w-24 h-8 opacity-50">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getRandomData()}>
                                    <Line type="monotone" dataKey="val" stroke={patient.id % 3 === 0 ? '#ef4444' : '#10b981'} strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <ChevronRight size={16} className="text-text-tertiary group-hover:text-accent transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Patients
