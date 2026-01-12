import React, { useEffect, useState, useCallback } from 'react';
import { socket } from '../services/api';
import api from '../services/api';
import {
    Activity,
    Thermometer,
    Heart,
    Zap,
    AlertCircle,
    CheckCircle2,
    Signal,
    MoreHorizontal
} from 'lucide-react';
import TelemetryChart from '../components/TelemetryChart';

// Max data points for sparkline
const MAX_HISTORY = 30;

export default function LiveWard() {
    const [patients, setPatients] = useState([]);
    const [liveData, setLiveData] = useState({});
    const [chartData, setChartData] = useState({}); // Stores history for charts
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/vet/patients');
                setPatients(res.data);
                if (socket.connected) {
                    res.data.forEach(p => socket.emit('subscribe_pet', { pet_id: p.id }));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchPatients();
    }, []);

    const handleLiveReading = useCallback((data) => {
        setLiveData(prev => ({
            ...prev,
            [data.pet_id]: { ...data, lastUpdated: Date.now() }
        }));

        // Update Chart History
        setChartData(prev => {
            const currentHistory = prev[data.pet_id] || [];
            const newPoint = { time: Date.now(), value: data.heart_rate };
            const newHistory = [...currentHistory, newPoint].slice(-MAX_HISTORY);
            return { ...prev, [data.pet_id]: newHistory };
        });
    }, []);

    useEffect(() => {
        if (!socket.connected) socket.connect();

        function onConnect() {
            setIsConnected(true);
            patients.forEach(p => socket.emit('subscribe_pet', { pet_id: p.id }));
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('live_reading', handleLiveReading);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('live_reading', handleLiveReading);
        };
    }, [patients, handleLiveReading]);

    return (
        <div className="p-8 min-h-screen bg-background text-text-primary font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-border">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1 flex items-center gap-3">
                        <Activity className="text-accent" />
                        Live Telemetry
                    </h1>
                    <p className="text-xs text-text-secondary uppercase tracking-widest font-mono">
                        Ward A • {patients.length} Monitored Units
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface border border-border">
                        <Signal size={14} className={isConnected ? "text-success" : "text-error"} />
                        <span className="text-xs font-mono text-text-secondary">{isConnected ? 'LINK_ESTABLISHED' : 'NO_CARRIER'}</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {patients.map(pet => {
                    const data = liveData[pet.id];
                    const history = chartData[pet.id] || [];
                    const isCritical = data?.ml_status && data.ml_status !== 'healthy';

                    return (
                        <div key={pet.id} className="bento-card group p-0 overflow-hidden border-l-4 border-l-transparent hover:border-l-accent transition-all">
                            {/* Card Header */}
                            <div className="p-5 pb-0 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-text-primary font-bold">
                                        {pet.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-sm text-text-primary leading-tight">{pet.name}</h2>
                                        <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wide">ID-{pet.id.toString().padStart(4, '0')}</p>
                                    </div>
                                </div>
                                <button className="text-text-tertiary hover:text-text-primary">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>

                            {/* Telemetry Chart Area */}
                            <div className="mt-4 mb-2 relative">
                                <div className="absolute top-2 right-5 z-10 flex gap-2">
                                    {data && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${isCritical
                                                ? 'bg-error/10 border-error/20 text-error'
                                                : 'bg-success/5 border-success/20 text-success'
                                            }`}>
                                            {data.ml_status || 'SYNCING'}
                                        </span>
                                    )}
                                </div>
                                {/* The Real-Time Chart */}
                                <TelemetryChart
                                    data={history}
                                    color={isCritical ? "#ef4444" : "#6366f1"}
                                    height={80}
                                />
                            </div>

                            {/* Vitals Grid */}
                            {data ? (
                                <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-surfaceHighlight/30">
                                    <div className="p-4 text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-text-tertiary mb-1">HR (BPM)</p>
                                        <div className={`text-xl font-mono font-medium ${isCritical ? 'text-error animate-pulse' : 'text-text-primary'}`}>
                                            {data.heart_rate}
                                        </div>
                                    </div>
                                    <div className="p-4 text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-text-tertiary mb-1">TEMP (°C)</p>
                                        <div className="text-xl font-mono font-medium text-text-primary">
                                            {data.temperature}
                                        </div>
                                    </div>
                                    <div className="p-4 text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-text-tertiary mb-1">AI CONF</p>
                                        <div className="text-xl font-mono font-medium text-accent">
                                            {data.ml_confidence}%
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 border-t border-border bg-surfaceHighlight/30 text-center py-6">
                                    <div className="inline-block w-4 h-4 border-2 border-border border-t-text-secondary rounded-full animate-spin mb-2"></div>
                                    <p className="text-[10px] font-mono text-text-tertiary">ESTABLISHING UPLINK...</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
