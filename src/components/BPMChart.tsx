"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface BPMChartProps {
    data: {
        name: string
        bpm: number
        energy: number
    }[]
}

export default function BPMChart({ data }: BPMChartProps) {
    // Group tracks into BPM ranges (e.g., 60-70, 70-80, etc.)
    const processData = () => {
        const bins: Record<string, number> = {}

        data.forEach(track => {
            const roundedBpm = Math.floor(track.bpm / 10) * 10
            const key = `${roundedBpm}-${roundedBpm + 9}`
            bins[key] = (bins[key] || 0) + 1
        })

        return Object.entries(bins)
            .map(([range, count]) => ({ range, count }))
            .sort((a, b) => Number(a.range.split('-')[0]) - Number(b.range.split('-')[0]))
    }

    const chartData = processData()

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--background-elevated)" />
                    <XAxis
                        dataKey="range"
                        stroke="var(--foreground-muted)"
                        tick={{ fill: 'var(--foreground-muted)' }}
                    />
                    <YAxis
                        stroke="var(--foreground-muted)"
                        tick={{ fill: 'var(--foreground-muted)' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--background-secondary)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--foreground)'
                        }}
                        cursor={{ fill: 'var(--background-elevated)' }}
                    />
                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
