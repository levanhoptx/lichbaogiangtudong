
import React from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  currentFile: string | null;
  description: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, accept, onChange, currentFile, description }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
        <FileText size={14} className="text-indigo-600" />
        {label}
      </label>
      <div className="relative group overflow-hidden rounded-[2rem]">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div className={`border-2 border-dashed rounded-[2rem] p-8 transition-all duration-500 flex flex-col items-center justify-center gap-4 bg-white relative z-10
          ${currentFile 
            ? 'border-emerald-500 bg-emerald-50/20' 
            : 'border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-50/10'}`}>
          
          <div className={`p-5 rounded-2xl transition-all duration-500 ${currentFile ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100' : 'bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-100'}`}>
            {currentFile ? (
              <CheckCircle2 size={32} />
            ) : (
              <Upload size={32} />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
              {currentFile || 'Tải tệp tin lên hệ thống'}
            </p>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{description}</p>
          </div>
          
          {!currentFile && (
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sẵn sàng phân tích</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
