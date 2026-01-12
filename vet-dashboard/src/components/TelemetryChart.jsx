import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/**
 * High-performance telemetry chart for realtime vitals
 * Simulates a medical-grade scrolling monitor
 */
export default function TelemetryChart({ data, color = "#6366f1", height = 60 }) {
    // Graceful fallback for empty data
    if (!data || data.length === 0) return (
        <div className="flex items-center justify-center opacity-30 text-[10px] font-mono uppercase" style={{ height }}>
            NO SIGNAL
        </div>
    );

    return (
        <div style={{ height, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#171717', borderColor: '#333', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ display: 'none' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#gradient-${color})`}
                        isAnimationActive={false} // Disable animation for realtime usage to prevent jitter
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
