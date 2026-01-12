import { useState } from 'react'
import { Plus, Download, FileText, CheckCircle2, AlertCircle, DollarSign, Search, Filter, Clock } from 'lucide-react'

const MOCK_INVOICES = [
    { id: 'INV-2024-001', patient: 'Max', owner: 'John Wick', amount: 450.00, status: 'paid', date: '2025-12-10' },
    { id: 'INV-2024-002', patient: 'Luna', owner: 'Sarah Connor', amount: 120.50, status: 'pending', date: '2025-12-12' },
    { id: 'INV-2024-003', patient: 'Bella', owner: 'Ellen Ripley', amount: 850.00, status: 'overdue', date: '2025-11-30' },
    { id: 'INV-2024-004', patient: 'Rocky', owner: 'Tony Stark', amount: 2500.00, status: 'paid', date: '2025-12-05' },
]

export default function Billing() {
    const [invoices, setInvoices] = useState(MOCK_INVOICES)
    const [filter, setFilter] = useState('all')

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'text-success bg-success/10 border-success/20';
            case 'pending': return 'text-warning bg-warning/10 border-warning/20';
            case 'overdue': return 'text-error bg-error/10 border-error/20';
            default: return 'text-text-tertiary';
        }
    }

    return (
        <div className="p-8 min-h-screen bg-background text-text-primary animate-fade-in font-sans">

            <div className="flex justify-between items-end mb-8 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">Financials</h1>
                    <p className="text-sm text-text-secondary">Manage invoices, payments, and revenue streams.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <Download size={16} /> Export Report
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus size={16} /> New Invoice
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bento-card p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-success/10 rounded-lg text-success"><DollarSign size={20} /></div>
                        <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">+12% vs last month</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-text-primary">$24,500</h3>
                        <p className="text-sm text-text-secondary mt-1">Total Revenue (Dec)</p>
                    </div>
                </div>
                <div className="bento-card p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-warning/10 rounded-lg text-warning"><AlertCircle size={20} /></div>
                        <span className="text-xs text-text-tertiary px-2 py-1 rounded border border-border">3 Invoices</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-text-primary">$1,250</h3>
                        <p className="text-sm text-text-secondary mt-1">Pending Payments</p>
                    </div>
                </div>
                <div className="bento-card p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-accent/10 rounded-lg text-accent"><FileText size={20} /></div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-text-primary">142</h3>
                        <p className="text-sm text-text-secondary mt-1">Invoices Generated</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bento-card overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-surfaceHighlight/50">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                        <input
                            placeholder="Search invoices..."
                            className="bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:border-accent outline-none w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'paid', 'pending', 'overdue'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-accent text-white' : 'hover:bg-surfaceHighlight text-text-secondary'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-surfaceHighlight border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-medium text-text-secondary">Invoice ID</th>
                            <th className="px-6 py-4 font-medium text-text-secondary">Client</th>
                            <th className="px-6 py-4 font-medium text-text-secondary">Date</th>
                            <th className="px-6 py-4 font-medium text-text-secondary">Amount</th>
                            <th className="px-6 py-4 font-medium text-text-secondary">Status</th>
                            <th className="px-6 py-4 font-medium text-text-secondary text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {invoices
                            .filter(i => filter === 'all' || i.status === filter)
                            .map((inv) => (
                                <tr key={inv.id} className="hover:bg-surface/50 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-text-primary font-medium">{inv.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-text-primary font-medium">{inv.owner}</div>
                                        <div className="text-xs text-text-tertiary">Patient: {inv.patient}</div>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">{inv.date}</td>
                                    <td className="px-6 py-4 font-mono font-medium text-text-primary">${inv.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                                            {inv.status === 'paid' && <CheckCircle2 size={10} />}
                                            {inv.status === 'pending' && <Clock size={10} />}
                                            {inv.status === 'overdue' && <AlertCircle size={10} />}
                                            <span className="capitalize">{inv.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-accent hover:text-accent-hover font-medium text-xs mr-3">View</button>
                                        <button className="text-text-secondary hover:text-text-primary text-xs">Download</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
