import React, { useState } from 'react';
import { Ticket, Search, Plus, Copy, Trash2, Calendar, CheckCircle2, XCircle, Clock, Filter, ChevronLeft, ChevronRight, Tag, X, Crown, Diamond, Zap } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const MOCK_COUPONS = [
    { id: 1, code: '2G96Y2679G', type: 'Premium 30 Hari', expired: '2026-04-03', used: '-', createdAt: '2026-03-03 12:45:49', status: 'active' },
    { id: 2, code: 'LUVM4TNQLD', type: 'Premium 7 Hari', expired: '~', used: 'sekolahonline55@gmail.com', createdAt: '2026-03-03 09:50:06', status: 'used' },
    { id: 3, code: 'Y43P6KSF8K', type: 'Premium 7 Hari', expired: '-', used: 'ubaid.namaku@gmail.com', createdAt: '2026-02-27 11:33:09', status: 'used' },
    { id: 4, code: 'GA3MB3HYPL', type: 'Premium 7 Hari', expired: '2026-02-15', used: '-', createdAt: '2026-02-15 07:24:13', status: 'expired' },
    { id: 5, code: '4EVT36EC3T', type: 'Premium 1 Tahun', expired: '2026-02-06', used: '-', createdAt: '2026-02-06 13:04:00', status: 'expired' },
    { id: 6, code: 'X9MG3L4V2K', type: 'Premium 7 Hari', expired: '2026-02-06', used: '-', createdAt: '2026-02-06 13:03:10', status: 'expired' },
    { id: 7, code: 'ME9BSUJZYN', type: 'Premium 30 Hari', expired: '~', used: 'dindaarista1520@gmail.com', createdAt: '2026-02-02 23:05:33', status: 'used' },
    { id: 8, code: 'BB8JMB88VZ', type: 'Premium 7 Hari', expired: '2026-01-30', used: '-', createdAt: '2026-01-30 22:23:39', status: 'expired' },
    { id: 9, code: '4AE66XQSVG', type: 'Premium 30 Hari', expired: '2026-01-22', used: '-', createdAt: '2026-01-22 19:39:35', status: 'expired' },
    { id: 10, code: 'BDVDH44LG3', type: 'Premium 30 Hari', expired: '~', used: 'gustinaresiyanti@gmail.com', createdAt: '2026-01-22 09:51:43', status: 'used' },
];

/* ─── Helper: status styling ─── */
function getStatusConfig(status) {
    switch (status) {
        case 'active':
            return { label: 'Aktif', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' };
        case 'used':
            return { label: 'Digunakan', icon: CheckCircle2, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-500' };
        case 'expired':
            return { label: 'Kadaluarsa', icon: XCircle, bg: 'bg-gray-50 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', border: 'border-gray-100 dark:border-gray-700', dot: 'bg-gray-400' };
        default:
            return { label: status, icon: Clock, bg: 'bg-gray-50 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-600', dot: 'bg-gray-400' };
    }
}

/* ─── Helper: type badge color ─── */
function getTypeBadge(type) {
    if (type.includes('1 Tahun')) return { bg: 'bg-gradient-to-r from-amber-50 to-orange-50', text: 'text-amber-700', border: 'border-amber-100', Icon: Crown };
    if (type.includes('30 Hari')) return { bg: 'bg-gradient-to-r from-violet-50 to-purple-50', text: 'text-violet-700', border: 'border-violet-100', Icon: Diamond };
    return { bg: 'bg-gradient-to-r from-blue-50 to-cyan-50', text: 'text-blue-700', border: 'border-blue-100', Icon: Zap };
}

export default function CouponPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const totalCoupons = MOCK_COUPONS.length;
    const activeCoupons = MOCK_COUPONS.filter(c => c.status === 'active').length;
    const usedCoupons = MOCK_COUPONS.filter(c => c.status === 'used').length;
    const expiredCoupons = MOCK_COUPONS.filter(c => c.status === 'expired').length;

    const stats = [
        { label: 'Total Kupon', value: totalCoupons, icon: Ticket, bgLight: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
        { label: 'Aktif', value: activeCoupons, icon: CheckCircle2, bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Digunakan', value: usedCoupons, icon: Tag, bgLight: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
        { label: 'Kadaluarsa', value: expiredCoupons, icon: XCircle, bgLight: 'bg-gray-100 dark:bg-gray-700/50', textColor: 'text-gray-500 dark:text-gray-400' },
    ];

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-gray-900 text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6 font-sans">
            <div className="max-w-[1200px] mx-auto overflow-hidden">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
                    <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            Coupon Setting
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1 sm:ml-[46px]">Kelola kode kupon, diskon, dan masa berlaku</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-none transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto">
                        <Plus className="w-4 h-4" />
                        Add New Coupon
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-5 sm:mb-6 w-full">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow min-w-0">
                            <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.bgLight} flex items-center justify-center`}>
                                <stat.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${stat.textColor}`} />
                            </div>
                            <span className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100 block mt-2 sm:mt-3">{stat.value}</span>
                            <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 sm:mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Table Controls */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:flex-1 sm:max-w-[400px]">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari kupon..."
                                className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all"
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-2 px-4 py-3.5 text-[13px] font-medium rounded-xl border transition-all w-full sm:w-auto ${showFilters
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col sm:flex-row gap-3">
                            <Select>
                                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectGroup>
                                        <SelectItem value="7hari">Premium 7 Hari</SelectItem>
                                        <SelectItem value="30hari">Premium 30 Hari</SelectItem>
                                        <SelectItem value="1tahun">Premium 1 Tahun</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectGroup>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="used">Digunakan</SelectItem>
                                        <SelectItem value="expired">Kadaluarsa</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    {/* Table wrapper */}
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px] text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Coupon Code</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valid Until</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {MOCK_COUPONS.map((coupon, index) => {
                                    const statusConfig = getStatusConfig(coupon.status);
                                    const typeBadge = getTypeBadge(coupon.type);
                                    return (
                                        <tr key={coupon.id} className="hover:bg-blue-50/20 transition-colors group">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[14px] font-bold text-gray-800 dark:text-gray-100 tracking-wide bg-gray-50 dark:bg-gray-700 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-700 font-mono">
                                                        {coupon.code}
                                                    </code>
                                                    <button
                                                        onClick={() => handleCopy(coupon.code, coupon.id)}
                                                        className="w-7 h-7 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors"
                                                        title="Copy code"
                                                    >
                                                        {copiedId === coupon.id ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold border ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border}`}>
                                                    <typeBadge.Icon className="w-3.5 h-3.5" />
                                                    {coupon.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-[13px] text-gray-600 dark:text-gray-300">
                                                {/* Assuming discount is not in MOCK_COUPONS, placeholder for now */}
                                                -
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {coupon.expired === '~' || coupon.expired === '-' ? (
                                                    <span className="text-[13px] text-gray-400">—</span>
                                                ) : (
                                                    <span className="text-[13px] text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        {coupon.expired}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${coupon.status === 'active' ? 'animate-pulse' : ''}`}></span>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5 transition-opacity">
                                                    <button title="Hapus" className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-[13px] text-gray-500 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-800 dark:text-gray-100">1-10</span> dari <span className="font-semibold text-gray-800 dark:text-gray-100">10</span> kupon
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-[13px] shadow-sm shadow-blue-200 dark:shadow-none">
                                1
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Coupon Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg tracking-wide uppercase">Generate Coupons</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                {/* Type */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">Coupon Type</label>
                                    <Select defaultValue="percent">
                                        <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 transition-all">
                                            <SelectValue placeholder="Discount Type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectGroup>
                                                <SelectItem value="7hari"><span className="inline-flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-blue-500" /> Premium 7 Hari</span></SelectItem>
                                                <SelectItem value="30hari"><span className="inline-flex items-center gap-2"><Diamond className="w-3.5 h-3.5 text-violet-500" /> Premium 30 Hari</span></SelectItem>
                                                <SelectItem value="1tahun"><span className="inline-flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-500" /> Premium 1 Tahun</span></SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Plan */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">Status</label>
                                    <Select defaultValue="active">
                                        <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 transition-all">
                                            <SelectValue placeholder="Active Status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectGroup>
                                                <SelectItem value="free">Free Account</SelectItem>
                                                <SelectItem value="premium">Premium Plan</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Coupon Code */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">Coupon Code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. PROMO2024"
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                                    />
                                </div>
                                {/* Discount Value */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">Discount Value (%)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 10"
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">Batal</button>
                            <button className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-none transition-all uppercase tracking-wide">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
