import { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import {
    Users,
    Wifi,
    Bell,
    Activity,
    TrendingUp,
    ArrowRight,
    Calendar,
    Zap,
    HeartPulse
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import StatCard from '../components/StatCard';
import IcuGrid from '../components/IcuGrid';

// Mock data for the Activity Trend Chart
const MOCK_TREND_DATA = [
    { time: '08:00', value: 45 },
    { time: '09:00', value: 52 },
    { time: '10:00', value: 48 },
    { time: '11:00', value: 65 },
    { time: '12:00', value: 55 },
    { time: '13:00', value: 58 },
    { time: '14:00', value: 72 },
    { time: '15:00', value: 68 },
    { time: '16:00', value: 75 },
    { time: '17:00', value: 60 },
    { time: '18:00', value: 55 },
    { time: '19:00', value: 40 },
];

export default function Dashboard({ user }) {
    const navigate = useNavigate()
    const [chartData, setChartData] = useState(MOCK_TREND_DATA)
    const [stats, setStats] = useState({
        total_pets: 0,
        critical_alerts: 0,
        active_devices: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/pets')
                setStats({
                    total_pets: res.data.length,
                    critical_alerts: 0,
                    active_devices: res.data.length
                })
            } catch (err) {
                console.error(err)
            }
        }
        fetchStats()

        // Socket Connection
        const socket = io('http://localhost:5000')
        socket.on('vital_update', (data) => {
            // Update chart data with live heartbeat (mock processing)
            setChartData(prev => {
                const newData = [...prev]
                if (newData.length > 20) newData.shift()
                newData.push({
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    value: data.heart_rate || 60 + Math.random() * 20
                })
                return newData
            })
        })

        return () => socket.disconnect()
    }, [])

    return (
        <div className="p-8 min-h-screen bg-background text-text-primary font-sans animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">
                        Mission Control
                    </h1>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        System Operational • v3.0 Professional Build
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-lg bg-surface border border-border flex items-center gap-2 text-xs font-mono text-text-secondary">
                        <Calendar size={14} />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* ICU Live Monitor (Pro Feature) */}
            <div className="mb-6">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <HeartPulse size={16} className="text-error" />
                    Critical Care Unit (Live)
                </h2>
                <IcuGrid />
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Patients"
                    value={stats.total_pets}
                    unit="Registered"
                    trend={12}
                    trendLabel="vs. last week"
                    icon={Users}
                />
                <StatCard
                    title="Active Telemetry"
                    value={stats.active_devices}
                    unit="Devices"
                    trend={0}
                    trendLabel="100% Uptime"
                    icon={Wifi}
                />
                <StatCard
                    title="Critical Incidents"
                    value={stats.critical_alerts}
                    unit="Events"
                    trend={-5}
                    trendLabel="Alert resolution: 98%"
                    icon={Bell}
                    color="error" // Prop to handle color logic if expanded
                />
                <StatCard
                    title="System Load"
                    value="24"
                    unit="%"
                    trend={2.4}
                    trendLabel="Optimal Performance"
                    icon={Zap}
                />
            </div>

            {/* Main Content: Chart + Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Large Chart Card */}
                <div className="lg:col-span-2 bento-card min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-base font-medium text-text-primary flex items-center gap-2">
                                <TrendingUp size={18} className="text-accent" />
                                Clinic Activity Volume
                            </h3>
                            <p className="text-xs text-text-tertiary">Combined telemetry throughput (Last 12 Hours)</p>
                        </div>
                        <div className="flex gap-2">
                            {['1H', '12H', '24H', '7D'].map(range => (
                                <button key={range} className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${range === '12H' ? 'bg-surfaceHighlight border-border text-text-primary' : 'border-transparent text-text-tertiary hover:bg-surface'}`}>
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2e2e2e" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#52525b', fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#52525b', fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#171717', borderColor: '#333', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Rail: Action Cards */}
                <div className="flex flex-col gap-6">
                    <Link to="/ward" className="bento-card flex-1 flex flex-col justify-center items-center text-center hover:border-accent/50 group cursor-pointer relative overflow-hidden transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="w-16 h-16 rounded-2xl bg-surfaceHighlight border border-border mb-6 flex items-center justify-center text-accent group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-xl shadow-black/20 z-10">
                            <HeartPulse size={32} />
                        </div>

                        <h3 className="text-lg font-medium text-text-primary mb-2 z-10">Live Ward Monitor</h3>
                        <p className="text-sm text-text-secondary max-w-[200px] mb-8 leading-relaxed z-10">
                            Access real-time patient telemetry streams and AI diagnostics.
                        </p>

                        <span className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-sm shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-all z-10">
                            Launch Console <ArrowRight size={16} />
                        </span>
                    </Link>

                    <div className="bento-card p-6">
                        <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center justify-between">
                            <span>Quick Actions</span>
                            <SettingsIcon />
                        </h3>
                        <div className="space-y-2">
                            <button onClick={() => navigate('/patients/new')} className="w-full text-left px-3 py-2 rounded-md hover:bg-surfaceHighlight text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> New Admission
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-surfaceHighlight text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Generate Reports
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-surfaceHighlight text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Manage Staff
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SettingsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    )
}
