import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Trash2, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchTransactions = async () => {
        try {
            const res = await API.get('/business/transactions');
            setTransactions(res.data.transactions || []);
        } catch (err) {
            console.error("Failed to load transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleDelete = async (id, type) => {
        if (!window.confirm("Are you sure you want to delete this transaction? (Blocked if day is closed).")) return;
        try {
            await API.delete(`/business/${type}/${id}`);
            fetchTransactions();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete transaction. Day may be closed.');
        }
    };

    const filteredTransactions = transactions.filter(tx => 
        tx.source?.toLowerCase().includes(search.toLowerCase()) || 
        tx.category?.toLowerCase().includes(search.toLowerCase()) ||
        tx.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
                    <p className="text-sm text-slate-500">View and manage all recorded incomes and expenses</p>
                </div>
                <div className="relative w-full md:w-72">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={16} />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search transactions..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                            <th className="p-4">Type</th>
                            <th className="p-4">Category / Source</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {loading ? (
                            <tr><td colSpan="6" className="p-6 text-center text-slate-400">Loading transactions...</td></tr>
                        ) : filteredTransactions.length === 0 ? (
                            <tr><td colSpan="6" className="p-6 text-center text-slate-400">No transactions recorded yet.</td></tr>
                        ) : (
                            filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                            tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {tx.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-slate-900">{tx.source || tx.category}</td>
                                    <td className="p-4 text-slate-500">{tx.description || '—'}</td>
                                    <td className={`p-4 font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        ${Number(tx.amount).toFixed(2)}
                                    </td>
                                    <td className="p-4 text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(tx.id, tx.type)} 
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Delete Transaction"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};