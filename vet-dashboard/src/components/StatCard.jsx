import { ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function StatCard({ title, value, unit, trend, trendLabel, icon: Icon, color = "accent" }) {
    const isPositive = trend > 0;

    return (
        <div className="bento-card p-5 flex flex-col justify-between group h-full">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-text-secondary text-xs uppercase font-bold tracking-wider">
                    {Icon && <Icon size={14} className="text-text-tertiary" />}
                    {title}
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
                        isPositive
                            ? "bg-success/10 border-success/20 text-success"
                            : "bg-error/10 border-error/20 text-error"
                    )}>
                        {isPositive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div className="flex items-baseline gap-2 mt-auto">
                <span className="text-3xl font-mono font-bold text-text-primary tracking-tight">
                    {value}
                </span>
                {unit && (
                    <span className="text-sm font-medium text-text-tertiary">
                        {unit}
                    </span>
                )}
            </div>

            {trendLabel && (
                <div className="mt-2 text-[10px] text-text-tertiary font-mono">
                    {trendLabel}
                </div>
            )}
        </div>
    );
}
