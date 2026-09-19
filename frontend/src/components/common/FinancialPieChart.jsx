import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { PieChart, TrendingUp, TrendingDown, Layers, Info } from 'lucide-react';

const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: cx + r * Math.cos(angleInRadians),
        y: cy + r * Math.sin(angleInRadians)
    };
};

const createArcPath = (cx, cy, rInner, rOuter, startAngle, endAngle) => {
    const diff = Math.min(359.99, Math.max(0.1, endAngle - startAngle));
    const actualEnd = startAngle + diff;

    const startOuter = polarToCartesian(cx, cy, rOuter, startAngle);
    const endOuter = polarToCartesian(cx, cy, rOuter, actualEnd);
    const startInner = polarToCartesian(cx, cy, rInner, actualEnd);
    const endInner = polarToCartesian(cx, cy, rInner, startAngle);

    const largeArcFlag = diff > 180 ? 1 : 0;

    return [
        `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
        `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
        `L ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
        `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
        'Z'
    ].join(' ');
};

export const FinancialPieChart = ({ 
    todayMetrics = {}, 
    lifetimeMetrics = {}, 
    title = "Financial Proportion Breakdown" 
}) => {
    const [period, setPeriod] = useState('today'); // 'today' | 'lifetime'
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const activeMetrics = period === 'today' ? todayMetrics : lifetimeMetrics;

    const income = Math.max(0, parseFloat(activeMetrics?.totalIncome || 0));
    const directExp = Math.max(0, parseFloat(activeMetrics?.totalDirectExp || 0));
    const operatingExp = Math.max(0, parseFloat(activeMetrics?.totalOperatingExp || 0));
    const netProfit = parseFloat(activeMetrics?.netProfit || 0);

    const totalVolume = income + directExp + operatingExp;

    const segments = [
        {
            id: 'income',
            label: 'Incomes',
            subtitle: 'Sales & Revenue',
            value: income,
            color: '#10b981', // Emerald Green
            lightColor: 'rgba(16, 185, 129, 0.12)',
            glowColor: 'rgba(16, 185, 129, 0.4)',
            icon: TrendingUp
        },
        {
            id: 'direct',
            label: 'Direct Expenses',
            subtitle: 'Stock / Goods (COGS)',
            value: directExp,
            color: '#f59e0b', // Amber
            lightColor: 'rgba(245, 158, 11, 0.12)',
            glowColor: 'rgba(245, 158, 11, 0.4)',
            icon: TrendingDown
        },
        {
            id: 'operating',
            label: 'Operating Expenses',
            subtitle: 'Overhead / Utilities',
            value: operatingExp,
            color: '#ef4444', // Rose Red
            lightColor: 'rgba(239, 68, 68, 0.12)',
            glowColor: 'rgba(239, 68, 68, 0.4)',
            icon: Layers
        }
    ];

    // Compute slice angles
    let currentAngle = 0;
    const slices = segments.map((seg, idx) => {
        const percentage = totalVolume > 0 ? (seg.value / totalVolume) * 100 : 0;
        const angle = totalVolume > 0 ? (seg.value / totalVolume) * 360 : 0;
        const start = currentAngle;
        const end = currentAngle + angle;
        currentAngle += angle;

        // Apply a small gap between slices if multiple segments exist
        const gap = (angle > 6 && segments.filter(s => s.value > 0).length > 1) ? 1.5 : 0;

        return {
            ...seg,
            index: idx,
            percentage,
            startAngle: start + gap / 2,
            endAngle: end - gap / 2,
            angle
        };
    });

    const activeHoverSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

    return (
        <div className="blue-card" style={{ padding: '1.75rem', position: 'relative' }}>
            {/* Header with Period Switcher */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--blue-100)',
                        color: 'var(--blue-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <PieChart size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                            {title}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                            Percentage distribution of income vs. cost classifications
                        </p>
                    </div>
                </div>

                {/* Period Selector Pills */}
                <div style={{
                    display: 'inline-flex',
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <button
                        type="button"
                        onClick={() => setPeriod('today')}
                        style={{
                            padding: '0.35rem 0.85rem',
                            fontSize: '0.775rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: period === 'today' ? 'var(--blue-600)' : 'transparent',
                            color: period === 'today' ? '#ffffff' : 'var(--text-secondary)',
                            boxShadow: period === 'today' ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none'
                        }}
                    >
                        Today's Day
                    </button>
                    <button
                        type="button"
                        onClick={() => setPeriod('lifetime')}
                        style={{
                            padding: '0.35rem 0.85rem',
                            fontSize: '0.775rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: period === 'lifetime' ? 'var(--blue-600)' : 'transparent',
                            color: period === 'lifetime' ? '#ffffff' : 'var(--text-secondary)',
                            boxShadow: period === 'lifetime' ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none'
                        }}
                    >
                        All-Time History
                    </button>
                </div>
            </div>

            {/* Main Visual Layout: Donut Chart on Left, Legend & Breakdown on Right */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                alignItems: 'center',
                gap: '2rem'
            }}>
                {/* SVG Donut Container */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <div style={{ width: '100%', maxWidth: '270px', position: 'relative' }}>
                        <svg viewBox="0 0 260 260" style={{ width: '100%', height: 'auto', display: 'block' }}>
                            <defs>
                                <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.12" />
                                </filter>
                            </defs>

                            {/* Center Background Plate */}
                            <circle cx="130" cy="130" r="95" fill="var(--bg-surface)" filter="url(#donutShadow)" />

                            {/* If zero activity, draw light placeholder circle */}
                            {totalVolume === 0 ? (
                                <circle 
                                    cx="130" 
                                    cy="130" 
                                    r="80" 
                                    fill="none" 
                                    stroke="var(--border-main)" 
                                    strokeWidth="32" 
                                    strokeDasharray="6 6"
                                    opacity="0.6"
                                />
                            ) : (
                                slices.map((slice) => {
                                    if (slice.value <= 0) return null;
                                    const isHovered = hoveredIdx === slice.index;
                                    const rInner = 60;
                                    const rOuter = isHovered ? 98 : 92;
                                    const pathD = createArcPath(130, 130, rInner, rOuter, slice.startAngle, slice.endAngle);

                                    return (
                                        <path
                                            key={slice.id}
                                            d={pathD}
                                            fill={slice.color}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                                filter: isHovered ? `drop-shadow(0 0 10px ${slice.glowColor})` : 'none',
                                                opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1
                                            }}
                                            onMouseEnter={() => setHoveredIdx(slice.index)}
                                            onMouseLeave={() => setHoveredIdx(null)}
                                            onClick={() => setHoveredIdx(hoveredIdx === slice.index ? null : slice.index)}
                                        />
                                    );
                                })
                            )}

                            {/* Inner Decorative Center Cutout */}
                            <circle cx="130" cy="130" r="54" fill="var(--bg-surface)" stroke="var(--border-subtle)" strokeWidth="2" />
                        </svg>

                        {/* Central Dynamic Text Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            pointerEvents: 'none',
                            width: '100px'
                        }}>
                            {activeHoverSlice ? (
                                <div className="animate-fade-in">
                                    <span style={{
                                        fontSize: '0.675rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                        color: activeHoverSlice.color,
                                        display: 'block'
                                    }}>
                                        {activeHoverSlice.label}
                                    </span>
                                    <span style={{
                                        fontSize: '1.4rem',
                                        fontWeight: 900,
                                        color: 'var(--text-primary)',
                                        display: 'block',
                                        lineHeight: 1.15
                                    }}>
                                        {activeHoverSlice.percentage.toFixed(1)}%
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {formatCurrency(activeHoverSlice.value)}
                                    </span>
                                </div>
                            ) : totalVolume > 0 ? (
                                <div>
                                    <span style={{
                                        fontSize: '0.675rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        color: 'var(--text-muted)',
                                        letterSpacing: '0.04em',
                                        display: 'block'
                                    }}>
                                        Net Profit
                                    </span>
                                    <span style={{
                                        fontSize: '1.15rem',
                                        fontWeight: 900,
                                        color: netProfit >= 0 ? '#10b981' : '#ef4444',
                                        display: 'block',
                                        lineHeight: 1.2
                                    }}>
                                        {formatCurrency(netProfit)}
                                    </span>
                                    <span style={{
                                        fontSize: '0.675rem',
                                        fontWeight: 700,
                                        color: income > 0 ? 'var(--blue-700)' : 'var(--text-muted)'
                                    }}>
                                        {income > 0 ? `${((netProfit / income) * 100).toFixed(0)}% Margin` : 'Zero Trade'}
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                        No Entries
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Interactive Decorated Legend Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {slices.map((slice) => {
                        const isHovered = hoveredIdx === slice.index;
                        const Icon = slice.icon;

                        return (
                            <div
                                key={slice.id}
                                onMouseEnter={() => setHoveredIdx(slice.index)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                onClick={() => setHoveredIdx(hoveredIdx === slice.index ? null : slice.index)}
                                style={{
                                    padding: '0.85rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: isHovered ? slice.lightColor : 'var(--bg-subtle)',
                                    border: `1px solid ${isHovered ? slice.color : 'var(--border-subtle)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: slice.lightColor,
                                        color: slice.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                {slice.label}
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                padding: '0.15rem 0.45rem',
                                                borderRadius: 'var(--radius-full)',
                                                backgroundColor: slice.color,
                                                color: '#ffffff'
                                            }}>
                                                {slice.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {slice.subtitle}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        color: slice.color,
                                        display: 'block'
                                    }}>
                                        {formatCurrency(slice.value)}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {totalVolume > 0 ? `${slice.percentage.toFixed(0)}% of total` : '0%'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Quick Cost Efficiency Ratio Tag */}
                    <div style={{
                        marginTop: '0.35rem',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.775rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                            <Info size={14} />
                            <span>Expense Ratio:</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {income > 0 
                                ? `${(((directExp + operatingExp) / income) * 100).toFixed(1)}% of Revenue` 
                                : 'Awaiting Sales Inflow'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

