
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Download, 
  Trash2, 
  Loader2, 
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  BookMarked,
  Layers,
  FileSpreadsheet,
  FileQuestion,
  ArrowRightCircle,
  Settings,
  HelpCircle,
  Layout,
  Zap
} from 'lucide-react';
import FileUpload from './components/FileUpload';
import { readDocxFile, readExcelFile, exportToExcel, downloadSampleTimetable } from './utils/fileUtils';
import { 
  parseTimetableWithGemini, 
  parseLessonPlansWithGemini, 
  mergeDataWithGemini 
} from './services/geminiService';
import { TimetableState, FinalReportRow } from './types';

const App: React.FC = () => {
  const [timetableState, setTimetableState] = useState<TimetableState | null>(null);
  const [lessonPlanFile, setLessonPlanFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [results, setResults] = useState<FinalReportRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('edu_timetable');
    if (saved) {
      try {
        setTimetableState(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('edu_timetable');
      }
    }
  }, []);

  const timetableSummary = useMemo(() => {
    if (!timetableState) return null;
    const days: Record<string, number> = {};
    const subjectsCount: Record<string, number> = {};
    const uniqueSubjects = new Set<string>();
    
    timetableState.data.forEach(entry => {
      days[entry.day] = (days[entry.day] || 0) + 1;
      if (entry.subject) {
        const sub = entry.subject.trim();
        uniqueSubjects.add(sub);
        subjectsCount[sub] = (subjectsCount[sub] || 0) + 1;
      }
    });

    return {
      days,
      totalSubjects: uniqueSubjects.size,
      totalPeriods: timetableState.data.length,
    };
  }, [timetableState]);

  const handleTimetableUpload = async (file: File | null) => {
    if (!file) return;
    setLoading(true);
    setLoadingStep('Đang đọc dữ liệu thời khóa biểu...');
    try {
      let text = '';
      if (file.name.endsWith('.docx')) text = await readDocxFile(file);
      else text = await readExcelFile(file);
      const parsedData = await parseTimetableWithGemini(text);
      const newState: TimetableState = {
        data: parsedData,
        fileName: file.name,
        updatedAt: new Date().toLocaleString('vi-VN')
      };
      setTimetableState(newState);
      localStorage.setItem('edu_timetable', JSON.stringify(newState));
    } catch (err) {
      setError('Lỗi khi tải thời khóa biểu.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!timetableState || !lessonPlanFile) return;
    setLoading(true);
    try {
      setLoadingStep('Đang phân tích giáo án...');
      const lessonText = await readDocxFile(lessonPlanFile);
      const lessonPlans = await parseLessonPlansWithGemini(lessonText);
      setLoadingStep('Đang khớp dữ liệu AI...');
      const merged = await mergeDataWithGemini(timetableState.data, lessonPlans);
      setResults(merged);
    } catch (err) {
      setError('Lỗi trong quá trình AI xử lý.');
    } finally {
      setLoading(false);
    }
  };

  const clearTimetable = () => {
    if (window.confirm('Xóa thời khóa biểu hiện tại?')) {
      localStorage.removeItem('edu_timetable');
      setTimetableState(null);
      setResults([]);
    }
  };

  // Fix: Implemented downloadReport function to resolve missing name error on line 357
  const downloadReport = () => {
    if (results.length === 0) return;
    const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    exportToExcel(results, `Lich_Bao_Giang_${dateStr}`);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-inter text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Decorative Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 blur-[120px] rounded-full"></div>
      </div>

      {/* Modern Professional Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 to-blue-700 p-3 rounded-2xl text-white shadow-xl">
                <Sparkles size={28} className="animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                EDU-GENIUS AI
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mt-1">Lịch Báo Giảng Thông Minh</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
            <button className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all flex items-center gap-2">
              <Layout size={14} /> Dashboard
            </button>
            <button className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all flex items-center gap-2">
              <Zap size={14} /> Nâng cấp
            </button>
            <button className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all flex items-center gap-2">
              <Settings size={14} /> Cấu hình
            </button>
          </nav>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Model Engine</span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                   Gemini 3 Flash <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </span>
             </div>
             <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                <HelpCircle size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-24 space-y-12">
        {/* Step-by-Step Toolbars Container */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Left Panel: Configuration & Timetable */}
          <div className="xl:col-span-5 space-y-8">
            <section className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 p-8 relative overflow-hidden group">
              {/* Toolbar Section Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-600">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">THỜI KHÓA BIỂU</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dữ liệu cố định theo tuần</p>
                  </div>
                </div>
                {timetableState && (
                  <button onClick={clearTimetable} className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {!timetableState ? (
                <div className="space-y-6">
                  <FileUpload 
                    label="Tải tệp lịch dạy"
                    description="Kéo thả Excel hoặc Word"
                    accept=".docx,.xlsx"
                    currentFile={null}
                    onChange={handleTimetableUpload}
                  />
                  <button 
                    onClick={downloadSampleTimetable}
                    className="w-full flex items-center justify-between p-5 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl group hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600 border border-indigo-50 group-hover:rotate-12 transition-transform">
                        <FileQuestion size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight">Tải tệp mẫu chuẩn</h4>
                        <p className="text-[11px] text-indigo-600 font-medium">Đảm bảo AI đọc dữ liệu chính xác nhất</p>
                      </div>
                    </div>
                    <ArrowRightCircle className="text-indigo-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={24} />
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  {/* Status Display Card */}
                  <div className="relative p-6 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-200 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Layout size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col gap-4">
                       <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                             <CheckCircle2 size={18} />
                          </div>
                          <span className="text-sm font-bold tracking-tight">Đã đồng bộ thời khóa biểu</span>
                       </div>
                       <h3 className="text-lg font-black truncate max-w-full leading-tight">{timetableState.fileName}</h3>
                       <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
                          <div className="flex items-center gap-1.5">
                             <Clock size={14} className="opacity-60" />
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{timetableState.updatedAt.split(',')[0]}</span>
                          </div>
                          <span className="px-3 py-1 bg-emerald-400 text-[10px] font-black uppercase rounded-full">Sẵn sàng</span>
                       </div>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-500">
                        <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                           <BookMarked size={20} />
                        </div>
                        <p className="text-2xl font-black text-slate-900">{timetableSummary?.totalSubjects}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Môn học đã quét</p>
                     </div>
                     <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-500">
                        <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                           <Clock size={20} />
                        </div>
                        <p className="text-2xl font-black text-slate-900">{timetableSummary?.totalPeriods}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tổng số tiết dạy</p>
                     </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Panel: Upload Lesson Plan & Process */}
          <div className="xl:col-span-7">
            <section className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 p-8 h-full flex flex-col group">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-600">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">2. Kế hoạch bài dạy</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tải tệp giáo án chi tiết theo tuần</p>
                </div>
              </div>

              <div className="flex-1 space-y-8">
                <FileUpload 
                  label="Tải giáo án tuần"
                  description="Chỉ chấp nhận định dạng Word (.docx)"
                  accept=".docx"
                  currentFile={lessonPlanFile?.name || null}
                  onChange={(file) => setLessonPlanFile(file)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/50 hover:shadow-md transition-all flex gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600 h-fit border border-indigo-50">
                         <Layers size={20} />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-900 uppercase mb-1">Xử lý đồ dùng</h4>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium italic">AI sẽ tự động lọc nội dung phần II trong mỗi bài dạy.</p>
                      </div>
                   </div>
                   <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/50 hover:shadow-md transition-all flex gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600 h-fit border border-emerald-50">
                         <Zap size={20} />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-900 uppercase mb-1">Phát hiện STEM</h4>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium italic">Tự động gắn nhãn nội dung điều chỉnh tích hợp thông minh.</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <button
                  disabled={!timetableState || !lessonPlanFile || loading}
                  onClick={handleProcess}
                  className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all transform active:scale-[0.98] relative overflow-hidden group/btn
                    ${!timetableState || !lessonPlanFile || loading 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white shadow-xl shadow-indigo-200'}`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                  {loading ? <Loader2 className="animate-spin" size={22} /> : <FileSpreadsheet size={22} className="group-hover/btn:scale-110 transition-transform" />}
                  {loading ? 'Hệ thống đang trích xuất dữ liệu...' : 'Tiến hành Soạn Lịch Báo Giảng'}
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Results Toolbar & Visualization */}
        {results.length > 0 && (
          <section className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white/80 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {/* Results Action Toolbar */}
            <div className="p-10 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-8 bg-slate-50/50 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-emerald-600 p-4 rounded-[1.5rem] text-white shadow-xl shadow-emerald-200">
                    <FileSpreadsheet size={32} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Bản nháp lịch báo giảng</h2>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                      <CheckCircle2 size={12} /> Khớp thành công
                    </span>
                    <span className="text-xs text-slate-400 font-bold">Dữ liệu được chuẩn hóa bởi Gemini AI</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={downloadReport}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-300 group active:scale-95"
                >
                  <Download size={18} className="group-hover:translate-y-0.5 transition-transform" /> Tải về tệp Excel (.xlsx)
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Thời gian</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Thông tin môn</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Nội dung bài học</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đồ dùng chuẩn bị</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ghi chú AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/40 transition-all duration-300 group">
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-900">{row.day}</span>
                           <span className="text-[10px] text-indigo-500 font-black uppercase mt-1 tracking-widest">Tiết {idx % 5 + 1}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{row.subject}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                           <span className={`text-sm font-bold leading-tight ${row.lessonTitle ? 'text-slate-900' : 'text-slate-300 italic'}`}>
                             {row.lessonTitle || 'Chưa cập nhật nội dung'}
                           </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 max-w-[300px]">
                        <p className={`text-xs leading-relaxed font-medium ${row.materials ? 'text-slate-500' : 'text-slate-300 italic'}`}>
                          {row.materials || 'Không yêu cầu đồ dùng đặc biệt'}
                        </p>
                      </td>
                      <td className="px-10 py-8">
                        {row.adjustments ? (
                          <div className="flex flex-wrap gap-2">
                            {row.adjustments.split(',').map((adj, i) => (
                              <span key={i} className="inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:scale-105 transition-transform">
                                {adj.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="w-6 h-1 bg-slate-100 rounded-full"></div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
               <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
                  <div className="w-12 h-px bg-slate-200"></div>
                  HẾT DANH SÁCH DỮ LIỆU
                  <div className="w-12 h-px bg-slate-200"></div>
               </div>
            </div>
          </section>
        )}
      </main>

      {/* Modern Loading Glass Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="relative mb-12 flex items-center justify-center">
             <div className="absolute w-40 h-40 bg-indigo-500/20 rounded-full animate-ping"></div>
             <div className="absolute w-32 h-32 bg-blue-500/30 rounded-full animate-pulse delay-75"></div>
             <div className="bg-slate-900 p-10 rounded-[2.5rem] relative shadow-2xl">
                <Loader2 className="animate-spin text-white" size={64} />
             </div>
          </div>
          <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase leading-none">Intelligence Processing</h3>
          <div className="max-w-md w-full">
             <div className="flex items-center justify-center gap-3 mb-6">
               <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
               <p className="text-indigo-600 font-black text-sm uppercase tracking-[0.3em] ml-2">{loadingStep}</p>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 rounded-full animate-[loading_2s_infinite_linear]"></div>
             </div>
          </div>
          <style>{`
            @keyframes loading {
              0% { transform: translateX(-100%); width: 30%; }
              50% { transform: translateX(50%); width: 60%; }
              100% { transform: translateX(250%); width: 30%; }
            }
          `}</style>
        </div>
      )}

      {/* Floating Info Corner */}
      <div className="fixed bottom-8 right-8 z-40">
         <button className="flex items-center gap-3 bg-white border border-slate-200 p-2 pr-5 rounded-full shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200 transition-all group">
            <div className="bg-indigo-600 p-3 rounded-full text-white group-hover:rotate-12 transition-transform shadow-lg">
               <Zap size={20} />
            </div>
            <div className="text-left">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
               <p className="text-xs font-bold text-slate-900 leading-none">System Online</p>
            </div>
         </button>
      </div>
    </div>
  );
};

export default App;
