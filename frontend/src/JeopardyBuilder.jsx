import { useState, useEffect } from 'react';

import { supabase } from './supabaseClient';

export default function JeopardyBuilder({ onBack }) {

    const [boardTitle, setBoardTitle] = useState('Mein Jeopardy Spiel');
    const [savedBoards, setSavedBoards] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [uploadingState, setUploadingState] = useState({});
    
    const [expandedQuestions, setExpandedQuestions] = useState({});

    const createEmptyBoard = () => Array.from({ length: 5 }, (_, cIdx) => ({
        name: `KATEGORIE ${cIdx + 1}`,
        questions: [100, 200, 300, 400, 500].map(pts => ({
            points: pts, text: '', answer: '', mediaType: 'none', mediaUrl: ''
        }))
    }));

    const [categories, setCategories] = useState(createEmptyBoard());

    const fetchBoards = async () => {
        const { data, error } = await supabase.from('boards').select('id, title, categories');
        if (!error && data) setSavedBoards(data);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const run = async () => {
            await fetchBoards();
        };
        run();
    }, []);





    const toggleExpand = (catIdx, qIdx) => {
        const key = `${catIdx}-${qIdx}`;
        setExpandedQuestions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const toggleAllInCategory = (catIdx, action) => {
        const updated = { ...expandedQuestions };
        [0, 1, 2, 3, 4].forEach(qIdx => {
            updated[`${catIdx}-${qIdx}`] = action === 'expand';
        });
        setExpandedQuestions(updated);
    };

    const handleFileUpload = async (event, catIdx, qIdx) => {
        const file = event.target.files[0];
        if (!file) return;
        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const stateKey = `${catIdx}-${qIdx}`;
        setUploadingState(prev => ({ ...prev, [stateKey]: true }));

        try {
            const { error: uploadError } = await supabase.storage
                .from('jeopardy-media')
                .upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('jeopardy-media')
                .getPublicUrl(fileName);

            const updated = [...categories];
            updated[catIdx].questions[qIdx]['mediaUrl'] = publicUrl;
            setCategories(updated);
        } catch (error) {
            alert("Upload-Fehler: " + error.message);
        } finally {
            setUploadingState(prev => ({ ...prev, [stateKey]: false }));
        }
    };

    const handleSaveToSupabase = async () => {
        if (!boardTitle.trim()) return alert("Bitte Titel eingeben!");
        const boardPayload = { title: boardTitle, categories: categories };

        if (selectedBoardId) {
            await supabase.from('boards').update(boardPayload).eq('id', selectedBoardId);
            alert("Änderungen gespeichert!");
        } else {
            const { data } = await supabase.from('boards').insert([boardPayload]).select();
            if (data && data[0]) setSelectedBoardId(data[0].id);
            alert("Board neu erstellt!");
        }
        fetchBoards();
    };

    const handleLoadBoard = (board) => {
        setSelectedBoardId(board.id);
        setBoardTitle(board.title);
        setCategories(board.categories);
        setExpandedQuestions({});
    };

    const handleNewBoard = () => {
        setSelectedBoardId(null);
        setBoardTitle('Neues Jeopardy Spiel');
        setCategories(createEmptyBoard());
        setExpandedQuestions({});
    };

    const handleCategoryNameChange = (catIdx, name) => {
        const updated = [...categories];
        updated[catIdx].name = name.toUpperCase();
        setCategories(updated);
    };

    const handleQuestionChange = (catIdx, qIdx, field, value) => {
        const updated = [...categories];
        updated[catIdx].questions[qIdx][field] = value;
        setCategories(updated);
    };

    const neonColors = [
        'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.15)]',
        'border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.15)]',
        'border-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.15)]',
        'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
        'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
    ];

    return (
        <div className="p-4 md:p-8 max-w-[98vw] mx-auto space-y-8 text-slate-300 min-h-screen bg-slate-950 font-sans selection:bg-cyan-500/30">
            
            {/* Header Section */}
            <div className="flex flex-wrap justify-between items-center gap-6 border-b border-slate-800 pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-sm">← Zurück</button>
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Studio<span className="text-cyan-500">Builder</span></h1>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">5x5 Pro-Matrix Editor (Ausklappbar)</p>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={handleNewBoard} className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-800 hover:bg-slate-900 transition-all active:scale-95">
                        Reset
                    </button>
                    <button onClick={handleSaveToSupabase} className="px-6 py-2 rounded-lg text-xs font-black uppercase bg-white text-black hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95">
                        {selectedBoardId ? 'Änderungen Sichern' : 'In Cloud Speichern'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
                
                {/* Sidebar: Library */}
                <div className="xl:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bibliothek</h3>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {savedBoards.map(b => (
                            <button
                                key={b.id}
                                onClick={() => handleLoadBoard(b)}
                                className={`w-full text-left p-3 rounded-xl border transition-all group ${
                                    selectedBoardId === b.id 
                                        ? 'border-cyan-500 bg-cyan-500/5 text-cyan-400' 
                                        : 'border-slate-900 bg-slate-900/30 hover:border-slate-700 text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {/* REPARIERT: b.id in String umgewandelt vor dem .slice */}
                                <div className="text-[10px] font-mono opacity-50 mb-1">Board ID: {String(b.id).slice(0, 5)}</div>
                                <div className="text-xs font-bold truncate uppercase">{b.title}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content: The Board */}
                <div className="xl:col-span-5 space-y-6">
                    {/* Title Input */}
                    <div className="relative group max-w-2xl">
                        <input
                            type="text" value={boardTitle} onChange={(e) => setBoardTitle(e.target.value)}
                            className="bg-transparent text-4xl font-black text-white focus:outline-none placeholder-slate-800 w-full tracking-tighter"
                            placeholder="NAME DEINES QUIZZES..."
                        />
                        <div className="absolute -bottom-2 left-0 w-24 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                    </div>

                    {/* 5 Spalten Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                        {categories.map((cat, catIdx) => (
                            <div key={catIdx} className={`flex flex-col gap-3 p-2 rounded-2xl border bg-slate-900/10 ${neonColors[catIdx]}`}>
                                
                                {/* Kategorie Header */}
                                <div className="space-y-1">
                                    <input
                                        type="text" value={cat.name} onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
                                        className="w-full bg-slate-900/50 border-none text-center font-black rounded-xl py-3 text-[10px] tracking-widest uppercase focus:ring-1 focus:ring-white/20 transition-all"
                                    />
                                    <div className="flex justify-center gap-2 text-[8px] font-mono uppercase text-slate-600 font-bold">
                                        <button onClick={() => toggleAllInCategory(catIdx, 'expand')} className="hover:text-slate-400">[All Open]</button>
                                        <button onClick={() => toggleAllInCategory(catIdx, 'collapse')} className="hover:text-slate-400">[All Close]</button>
                                    </div>
                                </div>

                                {/* Fragen-Stack */}
                                <div className="space-y-2">
                                    {cat.questions.map((q, qIdx) => {
                                        const isExpanded = !!expandedQuestions[`${catIdx}-${qIdx}`];
                                        const isUploading = uploadingState[`${catIdx}-${qIdx}`];
                                        const hasContent = q.text.trim() || q.answer.trim() || q.mediaType !== 'none';

                                        return (
                                            <div 
                                                key={qIdx} 
                                                className={`group border rounded-xl transition-all duration-200 ${
                                                    isExpanded 
                                                        ? 'bg-slate-900/90 border-slate-700/80 p-3 shadow-lg' 
                                                        : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 p-2.5 cursor-pointer hover:bg-slate-900/50'
                                                }`}
                                                onClick={() => !isExpanded && toggleExpand(catIdx, qIdx)}
                                            >
                                                {/* Zeile 1: Header */}
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-mono font-black ${isExpanded ? 'text-amber-400' : 'text-slate-400'}`}>
                                                            {q.points} PKT
                                                        </span>
                                                        {!isExpanded && hasContent && (
                                                            <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {!isExpanded && q.mediaUrl && (
                                                            <span className="text-[8px] uppercase tracking-tighter bg-cyan-950 text-cyan-400 font-bold px-1 rounded">Media</span>
                                                        )}
                                                        <button 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                toggleExpand(catIdx, qIdx); 
                                                            }}
                                                            className="text-slate-600 hover:text-slate-400 font-mono text-[10px] p-0.5"
                                                        >
                                                            {isExpanded ? '▲' : '▼'}
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Zeile 2: Ausklappbar */}
                                                {isExpanded && (
                                                    <div className="space-y-3 pt-3 style-fadeIn">
                                                        <textarea
                                                            placeholder="Frage formulieren..." value={q.text}
                                                            onChange={(e) => handleQuestionChange(catIdx, qIdx, 'text', e.target.value)}
                                                            className="w-full bg-transparent text-xs text-white border-none focus:ring-0 p-0 resize-none placeholder-slate-700 min-h-[45px]"
                                                            autoFocus
                                                        />
                                                        <input
                                                            type="text" placeholder="Antwort..." value={q.answer}
                                                            onChange={(e) => handleQuestionChange(catIdx, qIdx, 'answer', e.target.value)}
                                                            className="w-full bg-transparent text-[11px] text-emerald-400 font-bold border-none focus:ring-0 p-0 placeholder-emerald-900/30"
                                                        />

                                                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                                                            <select
                                                                value={q.mediaType}
                                                                onChange={(e) => handleQuestionChange(catIdx, qIdx, 'mediaType', e.target.value)}
                                                                className="bg-transparent text-[9px] text-slate-500 border-none p-0 focus:ring-0 uppercase font-black"
                                                            >
                                                                <option value="none">Kein Medium</option>
                                                                <option value="image">Bild</option>
                                                                <option value="audio">Sound</option>
                                                            </select>
                                                            
                                                            {q.mediaType !== 'none' && (
                                                                <label className="cursor-pointer">
                                                                    <div className={`text-[9px] font-black uppercase ${isUploading ? 'text-amber-500 animate-pulse' : 'text-cyan-500'}`}>
                                                                        {q.mediaUrl ? 'Ändern' : 'Upload'}
                                                                    </div>
                                                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, catIdx, qIdx)} accept={q.mediaType === 'image' ? 'image/*' : 'audio/*'} />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* REPARIERT: Valides React-Style Tag */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
                .style-fadeIn { animation: flexFade 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                @keyframes flexFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}