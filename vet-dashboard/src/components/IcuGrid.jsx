import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { Heart, Thermometer, Activity, AlertTriangle } from 'lucide-react'

// Mock initial data
const INITIAL_PATIENTS = [
    { id: 1, name: 'Max', species: 'Canine', bpm: 82, temp: 38.5, spo2: 98, status: 'stable' },
    { id: 2, name: 'Luna', species: 'Feline', bpm: 140, temp: 39.1, spo2: 96, status: 'warning' },
    { id: 3, name: 'Bella', species: 'Canine', bpm: 110, temp: 38.2, spo2: 99, status: 'stable' },
]

export default function IcuGrid() {
    const [patients, setPatients] = useState(INITIAL_PATIENTS)

    useEffect(() => {
        const socket = io('http://localhost:5000')

        socket.on('vital_update', (data) => {
            // Merge live data into patients array
            // Assuming data contains { pet_id, heart_rate, temperature, ... }
            if (!data.pet_id) return

            setPatients(prev => prev.map(p => {
                if (p.id === parseInt(data.pet_id) || (data.pet_id === 'sim_1' && p.id === 1)) {
                    // Critical Alert Logic
                    const isCritical = data.heart_rate > 160 || data.heart_rate < 40
                    return {
                        ...p,
                        bpm: Math.round(data.heart_rate),
                        temp: data.temperature ? parseFloat(data.temperature).toFixed(1) : p.temp,
                        status: isCritical ? 'critical' : 'stable'
                    }
                }
                return p
            }))
        })

        return () => socket.disconnect()
    }, [])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {patients.map(patient => (
                <div
                    key={patient.id}
                    className={`
                        bento-card p-5 border relative overflow-hidden transition-all duration-300
                        ${patient.status === 'critical' ? 'border-error/50 bg-error/5 shadow-lg shadow-error/20 animate-pulse-soft' : 'border-border'}
                        ${patient.status === 'warning' ? 'border-warning/50 bg-warning/5' : ''}
                    `}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                {patient.name}
                                {patient.status === 'critical' && <AlertTriangle size={16} className="text-error animate-bounce" />}
                            </h3>
                            <span className="text-xs uppercase font-mono text-text-tertiary tracking-wider">{patient.species} • ICU-0{patient.id}</span>
                        </div>
                        <div className={`
                            w-2 h-2 rounded-full 
                            ${patient.status === 'critical' ? 'bg-error animate-ping' : 'bg-success'}
                        `} />
                    </div>

                    {/* Vitals Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* HR */}
                        <div className="bg-surface p-3 rounded-lg flex flex-col items-center">
                            <Heart size={14} className={`mb-1 ${patient.bpm > 150 ? 'text-error' : 'text-text-tertiary'}`} />
                            <span className="text-xl font-mono font-bold text-text-primary">{patient.bpm}</span>
                            <span className="text-[10px] text-text-tertiary">BPM</span>
                        </div>

                        {/* Temp */}
                        <div className="bg-surface p-3 rounded-lg flex flex-col items-center">
                            <Thermometer size={14} className="text-text-tertiary mb-1" />
                            <span className="text-xl font-mono font-bold text-text-primary">{patient.temp}</span>
                            <span className="text-[10px] text-text-tertiary">°C</span>
                        </div>

                        {/* SpO2 */}
                        <div className="bg-surface p-3 rounded-lg flex flex-col items-center">
                            <Activity size={14} className="text-text-tertiary mb-1" />
                            <span className="text-xl font-mono font-bold text-text-primary">{patient.spo2}</span>
                            <span className="text-[10px] text-text-tertiary">%</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
