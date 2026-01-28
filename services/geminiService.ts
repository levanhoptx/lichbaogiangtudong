
import { GoogleGenAI, Type } from "@google/genai";
import { TimetableEntry, LessonPlan, FinalReportRow } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseTimetableWithGemini = async (text: string): Promise<TimetableEntry[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Hãy trích xuất thời khóa biểu từ văn bản sau và trả về định dạng JSON. 
    Văn bản chứa thông tin các buổi học trong tuần.
    Yêu cầu định dạng: Mảng các đối tượng { "day": "Thứ 2", "period": 1, "subject": "Toán" }.
    Lưu ý: "day" phải là Thứ 2, Thứ 3... Chủ Nhật. "period" là tiết học. "subject" là tên môn học.
    
    Nội dung văn bản:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            period: { type: Type.NUMBER },
            subject: { type: Type.STRING }
          },
          required: ["day", "period", "subject"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const parseLessonPlansWithGemini = async (text: string): Promise<LessonPlan[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Phân tích kế hoạch bài dạy sau và trích xuất thông tin các bài học.
    Mỗi bài học thường bắt đầu bằng tên bài và có các phần I, II, III...
    Tôi cần bạn lấy:
    1. Tên bài học (ngay sau tiêu đề bài).
    2. Tên môn học (nếu có đề cập, nếu không hãy đoán dựa trên nội dung).
    3. Nội dung phần "II. ĐỒ DÙNG DẠY HỌC" và "II. CHUẨN BỊ" (gộp lại thành 1 chuỗi văn bản).
    4. Kiểm tra trong nội dung bài học nếu có các từ khóa sau thì ghi chú viết tắt tương ứng vào "adjustments":
       - "Năng lực số" -> NLS
       - "An ninh quốc phòng" -> QPAN
       - "An toàn giao thông" -> ATGT
       - "Stem" -> STEM
       Nếu có nhiều mục, ngăn cách bằng dấu phẩy. Nếu không có để trống.
    
    Trả về mảng JSON { "subject": string, "lessonTitle": string, "materials": string, "adjustments": string }.
    
    Nội dung văn bản:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            lessonTitle: { type: Type.STRING },
            materials: { type: Type.STRING },
            adjustments: { type: Type.STRING }
          },
          required: ["subject", "lessonTitle", "materials", "adjustments"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const mergeDataWithGemini = async (timetable: TimetableEntry[], lessonPlans: LessonPlan[]): Promise<FinalReportRow[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Dựa trên thời khóa biểu và danh sách các bài học đã chuẩn bị, hãy điền tên bài học, đồ dùng dạy học và nội dung điều chỉnh vào đúng vị trí của môn học trong tuần.
    
    Nguyên tắc:
    1. Duyệt qua từng tiết học trong thời khóa biểu.
    2. Tìm bài học phù hợp với môn học đó trong danh sách kế hoạch bài dạy.
    3. Nếu một môn học xuất hiện nhiều lần (ví dụ Toán tiết 1 và Toán tiết 4), hãy lấy các bài học tương ứng theo thứ tự xuất hiện trong file kế hoạch.
    4. Nếu không có thông tin bài học cho môn đó, hãy để trống phần bài học, đồ dùng và điều chỉnh nhưng vẫn giữ nguyên dòng của môn học đó theo thời khóa biểu.
    
    Thời khóa biểu: ${JSON.stringify(timetable)}
    Kế hoạch bài dạy: ${JSON.stringify(lessonPlans)}
    
    Trả về mảng JSON { "day": string, "subject": string, "lessonTitle": string, "materials": string, "adjustments": string }. 
    Sắp xếp theo thứ tự thời gian (Thứ -> Tiết).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            subject: { type: Type.STRING },
            lessonTitle: { type: Type.STRING },
            materials: { type: Type.STRING },
            adjustments: { type: Type.STRING }
          },
          required: ["day", "subject", "lessonTitle", "materials", "adjustments"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};
