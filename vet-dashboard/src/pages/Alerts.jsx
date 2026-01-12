import { useState, useEffect } from 'react'
import api from '../services/api'
import { AlertTriangle, CheckCircle2, Bell } from 'lucide-react'

function Alerts() {
    const [alerts, setAlerts] = useState([])

    useEffect(() => {
        // Mock alerts for now
        setAlerts([])
    }, [])

    return (
        <div className="p-8 min-h-screen bg-background text-text-primary font-sans">
            <div className="mb-8 border-b border-border pb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1 flex items-center gap-3">
                    <Bell className="text-text-primary" /> System Alerts
                </h1>
                <p className="text-sm text-text-secondary">Critical events requiring attention</p>
            </div>

            {alerts.length > 0 ? (
                <div className="space-y-4">
                    {/* Mock alert display if we had them */}
                </div>
            ) : (
                <div className="bento-card p-12 flex flex-col items-center justify-center text-center border-dashed">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-1">No Active Alerts</h3>
                    <p className="text-sm text-text-tertiary max-w-xs">All monitored systems are within nominal parameters. No intervention required.</p>
                </div>
            )}
        </div>
    )
}

export default Alerts
