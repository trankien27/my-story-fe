import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Save, Layers } from "lucide-react";
import { Category, ActivePage } from "../../types";
import { dbService } from "../../services/dbService";
import { apiService } from "../../services/apiService";

interface CategoryManagementPageProps {
  onNavigate: (page: ActivePage) => void;
}

export default function CategoryManagementPage({ onNavigate }: CategoryManagementPageProps) {
  const [categories, setCategories] = useState(dbService.getCategories());
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setShowFormModal(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setShowFormModal(true);
  };

  const refreshCatalog = async () => {
    const catalog = await apiService.loadCatalog(dbService.getStories());
    dbService.hydrateCatalog(catalog.categories, catalog.stories);
    setCategories(catalog.categories);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Bạn có đồng ý xóa thể loại "${name}" khỏi hệ thống? Có thể gây lỗi hiển thị với các truyện đang áp dụng thể loại này.`)) {
      try {
        await apiService.deleteCategory(id);
        await refreshCatalog();
      } catch (error: any) {
        alert(error.message || "Không thể xóa thể loại.");
      }
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, name.trim());
      } else {
        await apiService.createCategory(name.trim());
      }
      await refreshCatalog();
      setShowFormModal(false);
    } catch (error: any) {
      alert(error.message || "Không thể lưu thể loại.");
    }
  };

  return (
    <div id="admin-categories-page" className="flex-1 bg-slate-50/50 p-6 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Top bar header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Quản Lý Thể Loại</h1>
            <p className="text-xs text-slate-400 mt-1">Phân bổ nhãn dán, giải nghĩa tóm tắt thể loại để trợ giúp độc giả tìm kiếm.</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-colors self-end sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Thêm Thể Loại Mới
          </button>
        </div>

        {/* Categories Grid Table */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-450 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 pl-6">ID thẻ</th>
                  <th className="p-4">Tên thể loại</th>
                  <th className="p-4">Slug định danh</th>
                  <th className="p-4">Giải thích mô tả thể loại</th>
                  <th className="p-4 text-right pr-6">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-xs text-slate-650 font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/45 transition-colors">
                    <td className="p-4 pl-6 font-mono text-[10px] text-slate-400">{cat.id}</td>
                    <td className="p-4 font-bold text-slate-800">{cat.name}</td>
                    <td className="p-4 font-mono text-[11px] text-indigo-600">{cat.slug}</td>
                    <td className="p-4 max-w-[300px] text-slate-405 truncate" title={cat.description}>
                      {cat.description || <span className="italic text-slate-300">Chưa bổ sung</span>}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 hover:bg-slate-105 text-slate-550 hover:text-slate-900 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-650 text-slate-400 rounded-lg transition-colors"
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

        {/* Categories form modal */}
        {showFormModal && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => setShowFormModal(false)} />
            <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white z-50 p-6 flex flex-col shadow-2xl overflow-y-auto animate-slide-left">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  {editingCategory ? "Cập Nhật Thể Loại" : "Thêm Thể Loại Truyện Tranh Mới"}
                </h3>
                <button onClick={() => setShowFormModal(false)} className="p-1 hover:bg-slate-50 rounded-full">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveSubmit} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Tên thể loại *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingCategory) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                      }
                    }}
                    placeholder="Viễn Tưởng"
                    className="w-full h-10 px-3.5 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Slug liên kết</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="vien-tuong"
                    className="w-full h-10 px-3.5 text-xs font-mono bg-slate-50 rounded-xl border border-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Giải thích mô tả sơ giản</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Thể loại truyện có cảnh quan giả tưởng tương lai kỹ vĩ..."
                    className="w-full p-3 text-xs bg-slate-50 rounded-xl border border-slate-100 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 h-12 bg-indigo-650 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4.5 w-4.5" />
                  Ghi Nhận Thẻ Thể Loại
                </button>

              </form>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
