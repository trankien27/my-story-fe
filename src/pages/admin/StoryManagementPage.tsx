import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, ExternalLink, X, Save, FileText, Check } from "lucide-react";
import { Story, Category, StoryStatus, ActivePage } from "../../types";
import { dbService } from "../../services/dbService";
import { apiService } from "../../services/apiService";

interface StoryManagementPageProps {
  onNavigate: (page: ActivePage) => void;
}

export default function StoryManagementPage({ onNavigate }: StoryManagementPageProps) {
  const [stories, setStories] = useState(dbService.getStories());
  const [search, setSearch] = useState("");
  const categories = dbService.getCategories();

  // Dialog states for Add/Edit Modal Form
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCoverUrl, setFormCoverUrl] = useState("");
  const [formStatus, setFormStatus] = useState<StoryStatus>("ongoing");
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([]);

  // Filter Story List
  const filteredStories = stories.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.author.toLowerCase().includes(search.toLowerCase()));

  const handleOpenAddModal = () => {
    setEditingStory(null);
    setFormTitle("");
    setFormAuthor("");
    setFormDescription("");
    setFormCoverUrl("https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop");
    setFormStatus("ongoing");
    setSelectedCategorySlugs([]);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (story: Story) => {
    setEditingStory(story);
    setFormTitle(story.title);
    setFormAuthor(story.author);
    setFormDescription(story.description);
    setFormCoverUrl(story.coverUrl);
    setFormStatus(story.status);
    setSelectedCategorySlugs(story.categories.map((c) => c.slug));
    setShowFormModal(true);
  };

  const refreshCatalog = async () => {
    const catalog = await apiService.loadCatalog(dbService.getStories());
    dbService.hydrateCatalog(catalog.categories, catalog.stories);
    setStories(catalog.stories);
  };

  const handleDeleteStory = async (storyId: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa vĩnh viễn bộ truyện "${title}" không? Tất cả chương tương ứng sẽ bị xóa.`)) {
      try {
        await apiService.deleteStory(storyId);
        await refreshCatalog();
      } catch (error: any) {
        alert(error.message || "Không thể xóa truyện.");
      }
    }
  };

  const handleToggleCategorySelection = (slug: string) => {
    if (selectedCategorySlugs.includes(slug)) {
      setSelectedCategorySlugs(selectedCategorySlugs.filter((s) => s !== slug));
    } else {
      setSelectedCategorySlugs([...selectedCategorySlugs, slug]);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAuthor.trim() || !formDescription.trim()) {
      alert("Vui lòng nhập đầy đủ các trường buộc!");
      return;
    }

    const compiledCats = categories.filter((c) => selectedCategorySlugs.includes(c.slug));

    const payload = {
      name: formTitle.trim(),
      thumbnailUrl: formCoverUrl.trim(),
      categoryIds: compiledCats.map((category) => Number(category.id)),
    };

    try {
      if (editingStory) {
        await apiService.updateStory(editingStory.id, payload, editingStory);
      } else {
        await apiService.createStory(payload);
      }
      await refreshCatalog();
      setShowFormModal(false);
    } catch (error: any) {
      alert(error.message || "Không thể lưu truyện.");
    }
  };

  return (
    <div id="admin-stories-page" className="flex-1 bg-slate-50/50 p-6 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Quản Lý Tác Phẩm</h1>
            <p className="text-xs text-slate-400 mt-1">Sáng tác truyện mới, cập nhật thông tin mô tả, thay đổi ảnh mô phỏng.</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-colors self-end sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Thêm Truyện Mới
          </button>
        </div>

        {/* Search tool block */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm tác phẩm bằng tên hoặc tác giả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs font-semibold bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Dynamic stories table conforming to specification */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-450 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 pl-6">Ảnh bìa</th>
                  <th className="p-4">Tên tác phẩm / Tác giả</th>
                  <th className="p-4">Slug định danh</th>
                  <th className="p-4">Thể loại</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Lượt xem</th>
                  <th className="p-4 text-right pr-6">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-xs text-slate-650 font-medium">
                {filteredStories.map((story) => (
                  <tr key={story.id} className="hover:bg-slate-50/45 transition-colors">
                    
                    {/* Cover photo */}
                    <td className="p-4 pl-6">
                      <img
                        src={story.coverUrl}
                        alt={story.title}
                        referrerPolicy="no-referrer"
                        className="h-14 w-10 object-cover rounded-lg border shadow-sm bg-slate-100"
                      />
                    </td>

                    {/* Title & Author */}
                    <td className="p-4 max-w-[200px]">
                      <p className="font-bold text-slate-850 line-clamp-1">{story.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Bởi: {story.author}</p>
                    </td>

                    {/* Slug */}
                    <td className="p-4 text-slate-400 font-mono text-[10px] select-all">
                      {story.slug}
                    </td>

                    {/* Genre Tags */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {story.categories.map((c) => (
                          <span key={c.id} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-semibold uppercase">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        story.status === "completed"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : story.status === "paused"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      }`}>
                        {story.status === "completed" ? "Hoàn thành" : story.status === "paused" ? "Tạm ngưng" : "Đang phát hành"}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="p-4 text-center font-bold text-slate-800">
                      {story.views.toLocaleString()}
                    </td>

                    {/* Actions Button panel */}
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Quick Chapter management button */}
                        <button
                          onClick={() => onNavigate({ type: "admin-chapters" })}
                          className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 text-slate-450 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                          title="Đăng tải và Quản lý Chapter"
                        >
                          <FileText className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(story)}
                          className="p-1.5 hover:bg-slate-100 text-slate-550 hover:text-slate-900 rounded-lg transition-colors"
                          title="Cập nhật tác phẩm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteStory(story.id, story.title)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-650 text-slate-400 rounded-lg transition-colors"
                          title="Gỡ bỏ truyện"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Dialog for Add/Edit Stories */}
        {showFormModal && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => setShowFormModal(false)} />
            <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white z-50 p-6 flex flex-col shadow-2xl overflow-y-auto animate-slide-left">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  {editingStory ? "Cập Nhật Thông Tin Truyện" : "Sáng tác tác phẩm truyện mới"}
                </h3>
                <button onClick={() => setShowFormModal(false)} className="p-1 hover:bg-slate-50 rounded-full">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveSubmit} className="space-y-4 flex-1">
                
                {/* Visual Preview banner of cover */}
                <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-2">
                  <img src={formCoverUrl} alt="Preview" className="h-20 w-16 object-cover rounded-lg bg-slate-200" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Xem trước ảnh đại diện</p>
                    <p className="text-xs font-semibold text-slate-700 mt-1 truncate max-w-[280px]">{formTitle || "Chưa đặt tên"}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tên truyện tranh *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Bản Hùng Ca Triều Bắc"
                    className="w-full h-10 px-3.5 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-100 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tác giả biên kịch *</label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Nguyễn Long Sơn"
                    className="w-full h-10 px-3.5 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-100 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Đường dẫn ảnh đại diện (Cover URL) *</label>
                  <input
                    type="text"
                    required
                    value={formCoverUrl}
                    onChange={(e) => setFormCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-10 px-3.5 text-xs font-mono bg-slate-50 rounded-xl border border-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Trạng thái xuất bản</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="h-10 w-full px-3 text-xs bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <option value="ongoing">Đang tiến hành ra chương</option>
                    <option value="completed">Đã hoàn thành xuất bản</option>
                    <option value="paused">Tạm dừng phát triển</option>
                  </select>
                </div>

                {/* Genre Checklists */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Danh mục thể loại truyện (Đa tuyển)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategorySlugs.includes(cat.slug);
                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleToggleCategorySelection(cat.slug)}
                          className={`cursor-pointer p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-indigo-50/50 border-indigo-200 text-indigo-600"
                              : "bg-slate-50 border-slate-100 text-slate-650 hover:bg-slate-100/50"
                          }`}
                        >
                          <span>{cat.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tóm tắt mô tả nội dung câu chuyện *</label>
                  <textarea
                    required
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Viết nội dung giới thiệu lôi cuốn độc giả..."
                    className="w-full p-3 text-xs font-medium leading-relaxed bg-slate-50 rounded-xl border border-slate-100 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 h-12 bg-indigo-605 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4.5 w-4.5" />
                  Ghi Nhận Cơ Sở Dữ Liệu
                </button>

              </form>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
