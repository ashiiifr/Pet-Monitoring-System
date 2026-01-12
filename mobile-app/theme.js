
// THEME: TITAN TACTICAL
// A cohesive, high-density UI system for professional hardware monitoring.

export const COLORS = {
    // Neural Baselines
    gridBackground: '#0F1115',   // Deep Gunmetal (Not Pitch Black)
    background: '#0F1115',       // Alias for main background
    surfaceCard: '#181B21',      // Lighter Gunmetal
    surfacefloat: '#22262E',     // Floating elements

    // Semantic Signals
    primary: '#4F46E5',         // Indigo-600 (Action)
    accent: '#06B6D4',          // Cyan-500 (Data/Connectivity)
    success: '#10B981',         // Emerald-500 (Stable)
    signalSuccess: '#10B981',   // Alias for signals
    warning: '#F59E0B',         // Amber-500 (Caution)
    danger: '#EF4444',          // Red-500 (Critical)
    signalAlert: '#EF4444',     // Alias for signals

    // Typography
    textTitle: '#F8FAFC',       // Slate-50
    textBody: '#94A3B8',        // Slate-400
    textMuted: '#64748B',       // Slate-500

    // Borders
    divider: '#2D3340',
};

export const METRICS = {
    padding: 20,
    radius: 12, // Consistent, modest radius
    iconSize: 22,
    headerHeight: 60,
};

export const TYPOGRAPHY = {
    header: { fontSize: 22, fontWeight: '700', letterSpacing: 0.5, color: COLORS.textTitle },
    subhead: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1.2 },
    body: { fontSize: 15, fontWeight: '400', color: COLORS.textBody },
    mono: { fontFamily: 'monospace', fontSize: 13, color: COLORS.accent },
    valueBig: { fontSize: 32, fontWeight: '300', color: COLORS.textTitle },
};
