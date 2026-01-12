import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import {
    ArrowLeft, Dog, Cat, Activity, Clock, FileText, AlertTriangle, CheckCircle2,
    Thermometer, Heart, Zap, Pill, Plus, X, Send, User, Phone, Syringe, History,
    FlaskConical, ClipboardList, Beaker, Printer, Bold, Italic, List, AlignLeft
} from 'lucide-react'

// Mock Lab Data
const MOCK_LABS = [
    { id: 1, date: '2025-12-15', type: 'CBC', result: 'Normal', flag: 'normal', details: 'WBC: 8.5, RBC: 6.2, HGB: 14.5' },
    { id: 2, date: '2025-12-15', type: 'Chem Panel', result: 'Elevated ALT', flag: 'warning', details: 'ALT: 120 (High), ALP: 85 (Normal)' },
    { id: 3, date: '2025-11-20', type: 'Urinalysis', result: 'Normal', flag: 'normal', details: 'USG: 1.035, pH: 6.5' },
]

function PatientDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [patient, setPatient] = useState(null)
    const [treatments, setTreatments] = useState([])
    const [activeTab, setActiveTab] = useState('overview') // overview | meds | labs
    const [showPrescribeModal, setShowPrescribeModal] = useState(false)
    const [rxForm, setRxForm] = useState({ medication: '', dosage: '', instructions: '' })

    const fetchPatientData = async () => {
        try {
            const [petRes, treatmentsRes] = await Promise.all([
                api.get(`/pets/${id}`),
                api.get(`/pets/${id}/treatments`)
            ])
            setPatient(petRes.data)
            setTreatments(treatmentsRes.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchPatientData()
    }, [id])

    const handlePrescribe = async (e) => {
        e.preventDefault()
        try {
            await api.post(`/pets/${id}/treatments`, rxForm)
            setShowPrescribeModal(false)
            setRxForm({ medication: '', dosage: '', instructions: '' })
            fetchPatientData()
        } catch (err) {
            alert('Failed to send prescription')
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (!patient) return <div className="p-8 text-text-tertiary">Loading patient record...</div>

    return (
        <div className="p-8 min-h-screen bg-background text-text-primary px-4 md:px-8 max-w-7xl mx-auto font-sans animate-fade-in relative print:p-0 print:bg-white print:text-black">

            {/* Print Styles Override */}
            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                        body { background: white; color: black; }
                        .bento-card { border: 1px solid #ddd; box-shadow: none; }
                    }
                `}
            </style>

            {/* Prescription Modal */}
            {showPrescribeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
                    <div className="bg-surface border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surfaceHighlight">
                            <h3 className="font-semibold text-text-primary flex items-center gap-2">
                                <Pill size={18} className="text-accent" /> New Prescription
                            </h3>
                            <button onClick={() => setShowPrescribeModal(false)} className="text-text-tertiary hover:text-text-primary">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handlePrescribe} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Medication Name</label>
                                <input
                                    required
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent outline-none"
                                    placeholder="e.g. Amoxicillin"
                                    value={rxForm.medication}
                                    onChange={e => setRxForm({ ...rxForm, medication: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Dosage</label>
                                <input
                                    required
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent outline-none"
                                    placeholder="e.g. 250mg twice daily"
                                    value={rxForm.dosage}
                                    onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Instructions</label>
                                {/* Mock Rich Text Editor */}
                                <div className="border border-border rounded-lg overflow-hidden bg-background focus-within:border-accent transition-colors">
                                    <div className="flex gap-1 p-2 bg-surfaceHighlight border-b border-border">
                                        <button type="button" className="p-1 hover:bg-surface rounded text-text-secondary"><Bold size={14} /></button>
                                        <button type="button" className="p-1 hover:bg-surface rounded text-text-secondary"><Italic size={14} /></button>
                                        <div className="w-px h-4 bg-border mx-1 self-center"></div>
                                        <button type="button" className="p-1 hover:bg-surface rounded text-text-secondary"><List size={14} /></button>
                                        <button type="button" className="p-1 hover:bg-surface rounded text-text-secondary"><AlignLeft size={14} /></button>
                                    </div>
                                    <textarea
                                        className="w-full bg-background px-3 py-2 text-sm text-text-primary outline-none h-24 resize-none"
                                        placeholder="Detailed administration instructions..."
                                        value={rxForm.instructions}
                                        onChange={e => setRxForm({ ...rxForm, instructions: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 py-2.5">
                                    <Send size={16} /> Transmit Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6 no-print">
                <button
                    onClick={() => navigate('/patients')}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
                >
                    <ArrowLeft size={16} /> Back to Registry
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-primary hover:bg-surfaceHighlight transition-colors text-xs font-medium"
                    >
                        <Printer size={14} /> Print Record
                    </button>
                </div>
            </div>

            {/* Patient Header */}
            <div className="bento-card mb-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-text-secondary shrink-0">
                        {patient.pet_type === 'dog' ? <Dog size={48} /> : <Cat size={48} />}
                    </div>

                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-semibold text-text-primary mb-2">{patient.name}</h1>
                                <div className="flex gap-3 text-sm text-text-secondary mb-4">
                                    <span className="bg-surface px-2 py-1 rounded border border-border">{patient.breed || 'Unknown Breed'}</span>
                                    <span className="bg-surface px-2 py-1 rounded border border-border">{patient.gender}</span>
                                    <span className="bg-surface px-2 py-1 rounded border border-border">{patient.age_years} Years</span>
                                    <span className="bg-surface px-2 py-1 rounded border border-border">{patient.weight_kg} kg</span>
                                </div>
                            </div>
                            <div className="flex gap-2 no-print">
                                <button
                                    onClick={() => setShowPrescribeModal(true)}
                                    className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-2 font-medium text-sm"
                                >
                                    <Pill size={16} /> Prescribe Meds
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-6 mt-6 border-b border-border no-print">
                            {['overview', 'meds', 'labs'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        pb-2 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 
                                        ${activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-text-tertiary hover:text-text-primary'}
                                    `}
                                >
                                    {tab === 'overview' && <ClipboardList size={16} />}
                                    {tab === 'meds' && <Pill size={16} />}
                                    {tab === 'labs' && <FlaskConical size={16} />}
                                    <span className="capitalize">{tab === 'meds' ? 'Medications' : tab === 'labs' ? 'Lab Results' : 'Overview'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">

                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Vitals Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-surface border border-border">
                                    <div className="flex items-center gap-2 text-xs text-text-tertiary uppercase tracking-wider mb-2">
                                        <Heart size={14} /> Avg Heart Rate
                                    </div>
                                    <div className="text-xl font-mono text-text-primary">85 <span className="text-xs text-text-tertiary">bpm</span></div>
                                </div>
                                <div className="p-4 rounded-lg bg-surface border border-border">
                                    <div className="flex items-center gap-2 text-xs text-text-tertiary uppercase tracking-wider mb-2">
                                        <Thermometer size={14} /> Low Temp
                                    </div>
                                    <div className="text-xl font-mono text-text-primary">38.2 <span className="text-xs text-text-tertiary">°C</span></div>
                                </div>
                                <div className="p-4 rounded-lg bg-surface border border-border">
                                    <div className="flex items-center gap-2 text-xs text-text-tertiary uppercase tracking-wider mb-2">
                                        <Zap size={14} /> Activity Score
                                    </div>
                                    <div className="text-xl font-mono text-text-primary">High</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                                    <History size={18} /> Medical History
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { date: '2025-12-10', type: 'Checkup', note: 'Routine physical. Weight stable. Teeth clean.' },
                                        { date: '2025-11-05', type: 'Vaccination', note: 'Rabies booster administered. Batch #9921.' },
                                        { date: '2025-08-22', type: 'Surgery', note: 'Neutering procedure. Recovery normal. No complications.' },
                                    ].map((event, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-lg bg-surface border border-border hover:bg-surfaceHighlight transition-colors">
                                            <div className="text-xs font-mono text-text-tertiary w-24 shrink-0 pt-1">
                                                {event.date}
                                            </div>
                                            <div>
                                                <div className="font-medium text-text-primary text-sm mb-1">{event.type}</div>
                                                <div className="text-text-secondary text-sm">{event.note}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'meds' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center no-print">
                                <h3 className="text-lg font-medium text-text-primary flex items-center gap-2">
                                    <Pill size={18} /> Active Treatments
                                </h3>
                                <button onClick={() => setShowPrescribeModal(true)} className="text-xs bg-surface border border-border px-3 py-1.5 rounded hover:bg-surfaceHighlight transition-colors">
                                    + Add History
                                </button>
                            </div>

                            {treatments.length > 0 ? (
                                <div className="space-y-4">
                                    {treatments.map(tx => (
                                        <div key={tx.id} className="bento-card p-5 relative overflow-hidden group">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent"></div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-text-primary text-lg">{tx.medication}</h4>
                                                    <div className="text-accent font-medium">{tx.dosage}</div>
                                                </div>
                                                <span className="text-xs font-mono text-text-tertiary px-2 py-1 rounded bg-surface border border-border">
                                                    Starts: {new Date(tx.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="mt-4 p-3 bg-surfaceHighlight rounded-lg border border-dashed border-border flex items-start gap-3">
                                                <Clock size={16} className="text-text-tertiary mt-0.5" />
                                                <p className="text-sm text-text-secondary leading-relaxed font-mono">
                                                    {tx.instructions}
                                                </p>
                                            </div>
                                            <div className="mt-4 flex gap-2 no-print">
                                                <button className="text-xs flex items-center gap-1 px-3 py-1.5 rounded border border-border hover:bg-surfaceHighlight transition-colors">
                                                    <CheckCircle2 size={12} className="text-success" /> Mark Dose Taken
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 rounded-lg border border-dashed border-border text-center">
                                    <Pill size={32} className="mx-auto text-text-tertiary mb-3 opacity-50" />
                                    <p className="text-text-secondary text-sm font-medium">No active prescriptions</p>
                                    <p className="text-text-tertiary text-xs mt-1">Prescribe medication to track adherence</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'labs' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center no-print">
                                <h3 className="text-lg font-medium text-text-primary flex items-center gap-2">
                                    <Beaker size={18} /> Laboratory Results
                                </h3>
                                <button className="text-xs bg-surface border border-border px-3 py-1.5 rounded hover:bg-surfaceHighlight transition-colors">
                                    Import Results (PDF)
                                </button>
                            </div>

                            <div className="border border-border rounded-lg overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-surfaceHighlight border-b border-border">
                                        <tr>
                                            <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
                                            <th className="px-4 py-3 font-medium text-text-secondary">Test Type</th>
                                            <th className="px-4 py-3 font-medium text-text-secondary">Result</th>
                                            <th className="px-4 py-3 font-medium text-text-secondary">Details</th>
                                            <th className="px-4 py-3 font-medium text-text-secondary text-right no-print">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {MOCK_LABS.map((lab) => (
                                            <tr key={lab.id} className="hover:bg-surface/50 transition-colors">
                                                <td className="px-4 py-3 font-mono text-text-tertiary">{lab.date}</td>
                                                <td className="px-4 py-3 text-text-primary font-medium">{lab.type}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${lab.flag === 'warning'
                                                        ? 'bg-warning/10 text-warning border-warning/20'
                                                        : 'bg-success/10 text-success border-success/20'
                                                        }`}>
                                                        {lab.flag === 'warning' && <AlertTriangle size={10} />}
                                                        {lab.result}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary max-w-xs truncate">{lab.details}</td>
                                                <td className="px-4 py-3 text-right no-print">
                                                    <button className="text-accent hover:underline text-xs">View Report</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column (Constant across tabs) */}
                <div className="space-y-8">
                    {/* Guardian Info */}
                    <div>
                        <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                            <User size={18} /> Guardian Information
                        </h3>
                        <div className="bento-card p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="font-medium text-text-primary">John Doe (Simulated)</div>
                                    <div className="text-xs text-text-secondary">Primary Caretaker</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-text-secondary p-2 rounded hover:bg-surfaceHighlight transition-colors cursor-pointer">
                                    <Phone size={14} />
                                    <span>+1 (555) 012-3456</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-text-secondary p-2 rounded hover:bg-surfaceHighlight transition-colors cursor-pointer">
                                    <Send size={14} />
                                    <span>john.doe@example.com</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 btn-secondary py-2 text-xs no-print">View Full Profile</button>
                        </div>
                    </div>

                    <div className="no-print">
                        <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} /> Clinical Alerts
                        </h3>
                        <div className="p-6 rounded-lg border border-dashed border-border text-center bg-surface/30">
                            <CheckCircle2 size={24} className="mx-auto text-success mb-2" />
                            <p className="text-text-secondary text-sm">No critical alerts</p>
                            <p className="text-text-tertiary text-xs mt-1">Vitals are within stable range</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PatientDetail

