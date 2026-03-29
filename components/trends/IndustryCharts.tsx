'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IndustryChartsProps {
    charts: any[];
}

export default function IndustryCharts({ charts }: IndustryChartsProps) {
    if (!charts || charts.length === 0) return null;

    // Filter out charts with no data
    const validCharts = charts.filter(c => c.title && c.values && c.values.some((v: number) => v > 0));
    if (validCharts.length === 0) return null;

    return (
        <div className="mb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-[var(--primary-yellow)] rounded-full"></div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Market Size Forecast</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {validCharts.map((chart, idx) => {
                    const data = chart.labels.map((label: string, i: number) => ({
                        year: label,
                        value: chart.values[i]
                    }));

                    return (
                        <div key={idx} className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-gray-700 transition-colors">
                            <div className="mb-4">
                                <h4 className="text-white font-bold text-sm line-clamp-1">{chart.title}</h4>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] text-gray-500 uppercase">Unit: {chart.unit}</span>
                                    {chart.source && (
                                        <span className="text-[10px] text-gray-400">Source: {chart.source}</span>
                                    )}
                                </div>
                            </div>

                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                        <XAxis 
                                            dataKey="year" 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#666', fontSize: 10 }}
                                            dy={5}
                                        />
                                        <YAxis 
                                            hide 
                                        />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ 
                                                backgroundColor: '#000', 
                                                border: '1px solid #333',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                color: '#fff'
                                            }}
                                            itemStyle={{ color: '#FFD700' }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {data.map((entry: any, index: number) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={index === data.length - 1 ? '#FFD700' : '#333'} 
                                                    fillOpacity={0.8}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
