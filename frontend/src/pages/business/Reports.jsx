import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Calendar, Filter } from 'lucide-react';

export const Reports = () => {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('daily');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            let url = `/business/reports?filter=${filter}`;
            if (startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const res = await API.get(url);
            setReports(res.data.report || []);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filter]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
                    <p className="text-sm text-slate-500">View and filter performance across daily, weekly, and monthly sessions</p>
                </div>
                
                {/* Filter Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                    <select 
                        value={filter} 
                        onChange={(e) => { setFilter(e.target.value); setStartDate(''); setEndDate(''); }}
                        className="p-2 border border-slate-200 rounded-lg text-sm font-medium bg-slate-50"
                    >
                        <option value="daily">Today (Daily)</option>
                        <option value="weekly">Last 7 Days (Weekly)</option>
                        <option value="monthly">Last 30 Days (Monthly)</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-1.5 border rounded-lg text-xs" />
                        <span className="text-slate-400">to</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-1.5 border rounded-lg text-xs" />
                        <button onClick={fetchReports} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Apply</button>
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Income</th>
                                <th className="p-4">Direct Exp</th>
                                <th className="p-4">Operating Exp</th>
                                <th className="p-4">Gross Profit</th>
                                <th className="p-4">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {loading ? (
                                <tr><td colSpan="7" className="p-6 text-center text-slate-400">Loading reports...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan="7" className="p-6 text-center text-slate-400">No financial records found for this period.</td></tr>
                            ) : (
                                reports.map((row) => (
                                    <tr key={row.session_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-medium text-slate-900">{row.date}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                                row.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="p-4">${row.totalIncome.toFixed(2)}</td>
                                        <td className="p-4 text-rose-600">${row.totalDirectExp.toFixed(2)}</td>
                                        <td className="p-4 text-rose-600">${row.totalOperatingExp.toFixed(2)}</td>
                                        <td className={`p-4 font-semibold ${row.grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            ${row.grossProfit.toFixed(2)}
                                        </td>
                                        <td className={`p-4 font-semibold ${row.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            ${row.netProfit.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};