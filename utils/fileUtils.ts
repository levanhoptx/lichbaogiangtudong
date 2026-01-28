
import * as XLSX from 'xlsx';

declare const mammoth: any;

export const readDocxFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const readExcelFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      resolve(csv);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data, {
    header: ["day", "subject", "lessonTitle", "materials", "adjustments"],
  });
  
  // Custom header names
  XLSX.utils.sheet_add_aoa(ws, [["Thứ/Ngày", "Môn Học", "Tên Bài Học", "Đồ Dùng Dạy Học", "Nội dung điều chỉnh, bổ sung (nếu có)"]], { origin: "A1" });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Báo Cáo Đồ Dùng");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const downloadSampleTimetable = () => {
  const sampleData = [
    { "Thứ ngày": "Thứ 2", "Tiết": 1, "Môn học": "Chào cờ" },
    { "Thứ ngày": "Thứ 2", "Tiết": 2, "Môn học": "Toán" },
    { "Thứ ngày": "Thứ 2", "Tiết": 3, "Môn học": "Tiếng Việt" },
    { "Thứ ngày": "Thứ 2", "Tiết": 4, "Môn học": "Tiếng Việt" },
    { "Thứ ngày": "Thứ 3", "Tiết": 1, "Môn học": "Toán" },
    { "Thứ ngày": "Thứ 3", "Tiết": 2, "Môn học": "Tự nhiên xã hội" },
    { "Thứ ngày": "Thứ 3", "Tiết": 3, "Môn học": "Tiếng Anh" },
    { "Thứ ngày": "Thứ 4", "Tiết": 1, "Môn học": "Toán" },
    { "Thứ ngày": "Thứ 4", "Tiết": 2, "Môn học": "Khoa học" },
  ];
  
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ThoiKhoaBieuMau");
  XLSX.writeFile(wb, "Mau_Thoi_Khoa_Bieu_Chuan.xlsx");
};
