import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Save, Eye, Layers, ChevronDown } from "lucide-react";
import { Chapter, Story, ActivePage } from "../../types";
import { dbService } from "../../services/dbService";

interface ChapterManagementPageProps {
  onNavigate: (page: ActivePage) => void;
}

export default function ChapterManagementPage({ onNavigate }: ChapterManagementPageProps) {
  const [chapters, setChapters] = useState(dbService.getAllChapters());
  const stories = dbService.getStories();

  const [selectedStoryId, setSelectedStoryId] = useState<string>("all");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Form Fields
  const [formStoryId, setFormStoryId] = useState("");
  const [formChapterNumber, setFormChapterNumber] = useState<number>(1);
  const [formTitle, setFormTitle] = useState("");
  const [formImagesValue, setFormImagesValue] = useState(""); // Comma split URL string

  // Filter Chapters List
  const filteredChapters = chapters
    .filter((ch) => selectedStoryId === "all" || ch.storyId === selectedStoryId)
    .sort((a, b) => {
      // Sort primarily by story name, then chapter number
      const storyA = stories.find((s) => s.id === a.storyId)?.title || "";
      const storyB = stories.find((s) => s.id === b.storyId)?.title || "";
      const compareStories = storyA.localeCompare(storyB);
      if (compareStories !== 0) return compareStories;
      return a.chapterNumber - b.chapterNumber;
    });

  const handleOpenAddModal = () => {
    setEditingChapter(null);
    setFormStoryId(stories[0]?.id || "");
    // auto guess next chapter number
    const targetStoryId = stories[0]?.id || "";
    const existingNum = chapters.filter((c) => c.storyId === targetStoryId).length;
    setFormChapterNumber(existingNum + 1);
    setFormTitle(`Cột Mốc Thứ ${existingNum + 1}`);

    // default pages Unsplash
    const samplePageUrls = [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=700",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=700",
      "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?q=80&w=700"
    ];
    setFormImagesValue(samplePageUrls.join(",\n"));
    setShowFormModal(true);
  };

  const handleStoryChangeAutoFill = (id: string) => {
    setFormStoryId(id);
    const existingNum = chapters.filter((c) => c.storyId === id).length;
    setFormChapterNumber(existingNum + 1);
    setFormTitle(`Bình Minh Chương ${existingNum + 1}`);
  };

  const handleOpenEditModal = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormStoryId(chapter.storyId);
    setFormChapterNumber(chapter.chapterNumber);
    setFormTitle(chapter.title);
    setFormImagesValue(chapter.images.join(",\n"));
    setShowFormModal(true);
  };

  const handleDeleteChapter = (id: string, text: string) => {
    if (confirm(`Bạn có đồng ý xóa "${text}" khỏi thư viện truyện ảnh không?`)) {
      dbService.deleteChapter(id);
      setChapters(dbService.getAllChapters());
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStoryId) {
      alert("Cần chọn một bộ truyện tranh tương ứng!");
      return;
    }
    if (!formTitle.trim()) {
      alert("Vui lòng đặt tên phân cảnh tập!");
      return;
    }

    // Split pages comma list
    const parsedImages = formImagesValue
      .split("\n")
      .map((line) => line.replace(/,/g, "").trim())
      .filter((url) => url.length > 5);

    if (parsedImages.length === 0) {
      alert("Vui lòng điền tối thiểu 1 url ảnh trang truyện tranh!");
      return;
    }

    if (editingChapter) {
      dbService.updateChapter(editingChapter.id, formChapterNumber, formTitle.trim(), parsedImages);
    } else {
      dbService.createChapter(formStoryId, formChapterNumber, formTitle.trim(), parsedImages);
    }

    setChapters(dbService.getAllChapters());
    setShowFormModal(false);
  };

  return (
    <div id="admin-chapters-page" className="flex-1 bg-slate-50/50 p-6 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Top bar header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Quản Lý Tập (Chapter)</h1>
            <p className="text-xs text-slate-400 mt-1">Sáng tác chương mới, chia sẻ sơ đồ ảnh, kết nối mạch truyện chính.</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-colors self-end sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Đăng Chapter Mới
          </button>
        </div>

        {/* Filter Selection Panel */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase shrink-0">Lọc theo bộ truyện:</label>
          <select
            value={selectedStoryId}
            onChange={(e) => setSelectedStoryId(e.target.value)}
            className="h-10 px-3 text-xs bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-100 font-bold text-slate-650"
          >
            <option value="all">Hiển thị mọi chương truyện</option>
            {stories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Chapters Table */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-450 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 pl-6">Bộ truyện tranh</th>
                  <th className="p-4 text-center">Tập số</th>
                  <th className="p-4">Tiêu đề phân chương</th>
                  <th className="p-4 text-center">Tổng số trang ảnh</th>
                  <th className="p-4">Ngày cập nhật</th>
                  <th className="p-4 text-right pr-6">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-xs text-slate-650 font-medium">
                {filteredChapters.map((ch) => {
                  const s = stories.find((x) => x.id === ch.storyId);
                  return (
                    <tr key={ch.id} className="hover:bg-slate-50/45 transition-colors">
                      
                      {/* Comic title */}
                      <td className="p-4 pl-6 font-bold text-slate-800">
                        {s ? s.title : "Tác phẩm ẩn danh"}
                      </td>

                      {/* Number */}
                      <td className="p-4 text-center font-bold text-indigo-650">
                        Chương {ch.chapterNumber}
                      </td>

                      {/* Name */}
                      <td className="p-4 text-slate-600 font-semibold italic">
                        "{ch.title}"
                      </td>

                      {/* Page counts */}
                      <td className="p-4 text-center">
                        <span className="bg-slate-100 text-slate-500 rounded-md px-2 py-1 font-bold text-[10px]">
                          {ch.images.length} trang
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(ch.createdAt).toLocaleDateString("vi-VN")} {new Date(ch.createdAt).toLocaleTimeString("vi-VN", { hour: "numeric", minute: "numeric" })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Read Chapter Preview */}
                          {s && (
                            <button
                              onClick={() => onNavigate({ type: "reader", storySlug: s.slug, chapterNumber: ch.chapterNumber })}
                              className="p-1.5 hover:bg-slate-105 text-slate-450 hover:text-slate-700 rounded-lg transition-colors"
                              title="Xem thử giao diện đọc"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(ch)}
                            className="p-1.5 hover:bg-slate-100 text-slate-550 hover:text-slate-900 rounded-lg transition-colors"
                            title="Sửa chương"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteChapter(ch.id, `Chương ${ch.chapterNumber} - ${ch.title}`)}
                            className="p-1.5 hover:bg-rose-50 hover:text-rose-650 text-slate-400 rounded-lg transition-colors"
                            title="Xóa chương"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chapter Editing Dialog Modal */}
        {showFormModal && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => setShowFormModal(false)} />
            <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white z-50 p-6 flex flex-col shadow-2xl overflow-y-auto animate-slide-left">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  {editingChapter ? "Cập Nhật Nội Dung Chapter" : "Đăng Tải Tập Mới (Chapter)"}
                </h3>
                <button onClick={() => setShowFormModal(false)} className="p-1 hover:bg-slate-50 rounded-full">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveSubmit} className="space-y-4 flex-1">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Thuộc tác phẩm *</label>
                  <select
                    disabled={!!editingChapter}
                    value={formStoryId}
                    onChange={(e) => handleStoryChangeAutoFill(e.target.value)}
                    className="h-10 w-full px-3 text-xs bg-slate-50 border border-slate-100 rounded-xl disabled:opacity-50"
                  >
                    {stories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tập số *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formChapterNumber}
                      onChange={(e) => setFormChapterNumber(Number(e.target.value))}
                      className="w-full h-10 px-3.5 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-100 text-center"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tên chương phụ *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Bình minh ló rạng"
                      className="w-full h-10 px-3.5 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-100"
                    />
                  </div>
                </div>

                {/* Comma split vertical images descriptor */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đường dẫn các liên kết ảnh trang vẽ (Mỗi hàng 1 URL)</label>
                    <span className="text-[9px] text-indigo-500 font-bold cursor-pointer hover:underline" onClick={() => {
                      const list = [
                        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=700",
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700",
                        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=700"
                      ];
                      setFormImagesValue(list.join(",\n"));
                    }}>Tự động điền dữ liệu mẫu</span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={formImagesValue}
                    onChange={(e) => setFormImagesValue(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-...\nhttps://images.unsplash.com/photo-..."
                    className="w-full p-3 font-mono text-[10px] leading-relaxed bg-slate-50 rounded-xl border border-slate-100 focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-400 leading-snug">Hệ thống sẽ render tự động các liên kết ảnh theo thứ tự dọc từ trên xuống dưới ứng với từng hàng văn bản.</p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 h-12 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4.5 w-4.5" />
                  Lưu Chapter dữ liệu
                </button>

              </form>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
