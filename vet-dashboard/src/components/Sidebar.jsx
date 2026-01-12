import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Activity, Users, Bell, LogOut, Stethoscope, Calendar } from 'lucide-react'

function Sidebar({ user, onLogout }) {
    const navigate = useNavigate()

    const handleLogout = () => {
        onLogout()
        navigate('/login')
    }

    const navClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group ${isActive
            ? 'bg-surfaceHighlight text-text-primary'
            : 'text-text-secondary hover:bg-surface hover:text-text-primary'
        }`

    return (
        <aside className="w-64 h-screen bg-background border-r border-border flex flex-col pt-6 pb-4 px-4 font-sans select-none">
            {/* Brand */}
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center text-accent shadow-inner border border-white/5">
                    <Stethoscope size={16} />
                </div>
                <span className="font-semibold text-text-primary tracking-tight">
                    VetPortal
                </span>
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-1">
                <div className="px-2 mb-2 text-[10px] font-bold uppercase text-text-tertiary tracking-wider font-mono">
                    Menu
                </div>
                <NavLink to="/dashboard" className={navClass}>
                    <LayoutDashboard size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/ward" className={navClass}>
                    <div className="relative">
                        <Activity size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                        {/* Subtle ping for active ward */}
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full animate-pulse opacity-80"></span>
                    </div>
                    <span>Live Ward</span>
                </NavLink>

                <NavLink to="/patients" className={navClass}>
                    <Users size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>Patients</span>
                </NavLink>

                <NavLink to="/alerts" className={navClass}>
                    <Bell size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>Alerts</span>
                </NavLink>

                <NavLink to="/appointments" className={navClass}>
                    <Calendar size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>Schedule</span>
                </NavLink>

                <NavLink to="/billing" className={navClass}>
                    <div className="relative">
                        {/* Dollar sign or Credit Card icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                    </div>
                    <span>Billing</span>
                </NavLink>
            </div>

            {/* User Profile */}
            <div className="pt-4 border-t border-border mt-auto">
                <div className="flex items-center gap-3 px-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-text-secondary font-medium">
                        DR
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{user?.name || 'Doctor'}</div>
                        <div className="text-xs text-text-tertiary truncate">Veterinarian (Admin)</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-border text-text-secondary hover:bg-surface hover:text-text-primary hover:border-borderHighlight transition-all text-xs font-medium"
                >
                    <LogOut size={14} />
                    Log Out
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
