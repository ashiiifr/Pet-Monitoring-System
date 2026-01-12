import { useState, useEffect } from 'react'
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Plus, MoreHorizontal } from 'lucide-react'

// Mock Schedule
const MOCK_APPOINTMENTS = [
    { id: 1, time: '09:00', patient: 'Bella', owner: 'John Smith', type: 'Checkup', status: 'confirmed' },
    { id: 2, time: '10:30', patient: 'Max', owner: 'Sarah Connor', type: 'Vaccination', status: 'completed' },
    { id: 3, time: '11:00', patient: 'Charlie', owner: 'Mike Ross', type: 'Surgery', status: 'pending' },
    { id: 4, time: '14:00', patient: 'Luna', owner: 'Emily Blunt', type: 'Follow-up', status: 'confirmed' },
]

export default function Appointments() {
    const [selectedDate, setSelectedDate] = useState(new Date())

    return (
        <div className="p-8 min-h-screen bg-background text-text-primary animate-fade-in font-sans">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">Schedule</h1>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                        Manage clinic appointments and surgeries.
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> New Appointment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Mini Calendar */}
                <div className="space-y-6">
                    <div className="bento-card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-text-primary">January 2026</h3>
                            <div className="flex gap-1">
                                <button className="p-1 hover:bg-surfaceHighlight rounded"><ChevronLeft size={16} /></button>
                                <button className="p-1 hover:bg-surfaceHighlight rounded"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        {/* Simplified Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2 text-center text-xs mb-2 text-text-tertiary font-mono uppercase">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center text-sm">
                            {Array.from({ length: 31 }, (_, i) => (
                                <button
                                    key={i}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors 
                                        ${i + 1 === 8 ? 'bg-accent text-white font-bold shadow-lg shadow-accent/20' : 'text-text-secondary hover:bg-surfaceHighlight'}
                                    `}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bento-card p-6">
                        <h3 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                            <User size={16} /> Staff On Duty
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-xs font-bold">DR</div>
                                <div>
                                    <div className="text-sm font-medium text-text-primary">Dr. Sarah</div>
                                    <div className="text-xs text-text-tertiary">Surgeon</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-xs font-bold">VT</div>
                                <div>
                                    <div className="text-sm font-medium text-text-primary">Mike T.</div>
                                    <div className="text-xs text-text-tertiary">Technician</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Daily Agenda */}
                <div className="lg:col-span-3 bento-card min-h-[600px] relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 p-6 pb-0">
                        <Calendar size={20} className="text-accent" />
                        <h2 className="text-lg font-medium text-text-primary">Thursday, Jan 8th</h2>
                    </div>

                    <div className="relative">
                        {/* Current Time Indicator (Mocked at 10:45 AM position approx) */}
                        <div className="absolute left-20 right-0 top-[220px] z-10 flex items-center pointer-events-none">
                            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                            <div className="h-px bg-red-500 flex-1"></div>
                        </div>

                        {/* Time Slots */}
                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                            <div key={time} className="flex border-t border-border/50 group hover:bg-surfaceHighlight/20 transition-colors">
                                <div className="w-20 py-8 pr-4 text-right text-xs font-mono text-text-tertiary border-r border-border shrink-0">
                                    {time}
                                </div>
                                <div className="flex-1 relative py-2 pl-4 min-h-[100px]">
                                    {/* Appointment Cards */}
                                    {MOCK_APPOINTMENTS.filter(a => a.time.startsWith(time.substring(0, 2))).map(apt => (
                                        <div key={apt.id} className="bg-surface border-l-4 border-l-accent border-y border-r border-border rounded-r-lg p-3 w-11/12 hover:shadow-md transition-all cursor-pointer flex justify-between items-start mb-2 animate-scale-in"
                                            style={{ borderLeftColor: apt.type === 'Surgery' ? '#ef4444' : apt.type === 'Vaccination' ? '#a855f7' : '#3b82f6' }}
                                        >
                                            <div className="flex gap-4">
                                                <div>
                                                    <div className="text-sm font-medium text-text-primary flex items-center gap-2">
                                                        {apt.patient} <span className="text-text-tertiary font-normal">({apt.owner})</span>
                                                    </div>
                                                    <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                                                        <span className="px-1.5 py-0.5 rounded bg-surfaceHighlight border border-border text-[10px] uppercase">{apt.type}</span>
                                                        <span className="flex items-center gap-1"><Clock size={10} /> 45m</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-text-tertiary hover:text-text-primary">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
