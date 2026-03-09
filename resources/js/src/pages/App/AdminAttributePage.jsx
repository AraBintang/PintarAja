import React, { useState } from 'react';
import { Zap, Plus, Trash2, Edit2, Search, X } from 'lucide-react';

export default function AdminAttributePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingId, setEditingId] = useState(null);
    const [typeName, setTypeName] = useState('');
    const [sections, setSections] = useState(['']); // Array of section names

    // Mock data with sections
    const [attributes, setAttributes] = useState([
        { id: 1, type: 'Skripsi', sections: ['Bab 1: Pendahuluan', 'Bab 2: Tinjauan Pustaka', 'Bab 3: Metodologi', 'Bab 4: Hasil & Pembahasan', 'Bab 5: Penutup'] },
        { id: 2, type: 'Tesis', sections: ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion'] },
        { id: 3, type: 'Disertasi', sections: ['Abstract', 'Chapter 1: Intro', 'Chapter 2: Theory', 'Chapter 3: Design', 'Chapter 4: Data', 'Chapter 5: Synthesis', 'Chapter 6: Conclusion'] },
        { id: 4, type: 'Makalah', sections: ['Pendahuluan', 'Pembahasan', 'Kesimpulan', 'Daftar Pustaka'] },
        { id: 5, type: 'Proposal Penelitian', sections: ['Latar Belakang', 'Rumusan Masalah', 'Tujuan', 'Manfaat', 'Tinjauan Pustaka', 'Metode'] },
    ]);

    const handleOpenModal = (mode, attr = null) => {
        setModalMode(mode);
        if (mode === 'edit' && attr) {
            setEditingId(attr.id);
            setTypeName(attr.type);
            setSections(attr.sections && attr.sections.length > 0 ? attr.sections : ['']);
        } else {
            setEditingId(null);
            setTypeName('');
            setSections(['']);
        }
        setIsModalOpen(true);
    };

    const handleAddSection = () => {
        setSections([...sections, '']);
    };

    const handleRemoveSection = (index) => {
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections.length > 0 ? newSections : ['']);
    };

    const handleSectionChange = (index, value) => {
        const newSections = [...sections];
        newSections[index] = value;
        setSections(newSections);
    };

    const handleSave = () => {
        if (!typeName.trim()) return;

        const filteredSections = sections.filter(s => s.trim() !== '');

        if (modalMode === 'add') {
            const newItem = {
                id: attributes.length > 0 ? Math.max(...attributes.map(a => a.id)) + 1 : 1,
                type: typeName,
                sections: filteredSections
            };
            setAttributes([...attributes, newItem]);
        } else {
            setAttributes(attributes.map(attr =>
                attr.id === editingId ? { ...attr, type: typeName, sections: filteredSections } : attr
            ));
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus paper ini?')) {
            setAttributes(attributes.filter(attr => attr.id !== id));
        }
    };

    const filteredAttributes = attributes.filter(attr =>
        attr.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-gray-900 text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6 font-sans">
            <div className="max-w-[1200px] mx-auto overflow-hidden">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            Data Attribute AI
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1 sm:ml-[46px]">Kelola jenis paper dan struktur section dokumen AI</p>
                    </div>

                    <button
                        onClick={() => handleOpenModal('add')}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-none transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto">
                        <Plus className="w-4 h-4" />
                        Add New Paper
                    </button>
                </div>

                {/* Table Controls (Search & Add) */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-[320px]">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search paper type..."
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">


                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-3.5 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[80px]">No.</th>
                                    <th className="px-6 py-3.5 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paper Type</th>
                                    <th className="px-6 py-3.5 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sections</th>
                                    <th className="px-6 py-3.5 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-[180px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {filteredAttributes.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-400">
                                            {index + 1}.
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">{item.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {item.sections && item.sections.length > 0 ? (
                                                    item.sections.map((sec, sIdx) => (
                                                        <span key={sIdx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-medium border border-blue-100 dark:border-blue-900/30">
                                                            {sec}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 italic">No sections defined</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 w-[180px] text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal('edit', item)}
                                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAttributes.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 text-[14px]">
                                            Tidak ada data atribut yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-white font-bold text-lg tracking-wide">
                                    {modalMode === 'add' ? 'Add New Paper' : 'Edit Paper Setting'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                                {/* Paper Type Name */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">Paper Type Name</label>
                                    <input
                                        type="text"
                                        value={typeName}
                                        onChange={(e) => setTypeName(e.target.value)}
                                        placeholder="e.g. Skripsi"
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Sections Management */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">Paper Sections</label>
                                        <button
                                            onClick={handleAddSection}
                                            className="text-[12px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Section
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {sections.map((section, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-300 w-4">
                                                        {idx + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={section}
                                                        onChange={(e) => handleSectionChange(idx, e.target.value)}
                                                        placeholder={`Section ${idx + 1} Name`}
                                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-8 pr-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveSection(idx)}
                                                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-500 dark:hover:text-rose-300 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-gray-400 italic">Sections determine the breakdown of content for this paper type.</p>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">Batal</button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-none transition-all uppercase tracking-wide"
                                >
                                    {modalMode === 'add' ? 'Simpan Paper' : 'Update Paper'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

