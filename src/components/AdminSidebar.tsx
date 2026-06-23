import { LayoutDashboard, BookMarked, Layers, Users, Home, BookOpen, ChevronRight } from "lucide-react";
import { ActivePage } from "../types";

interface AdminSidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export default function AdminSidebar({ activePage, onNavigate }: AdminSidebarProps) {
  const menuItems = [
    { title: "Dashboard Tổng Quan", icon: LayoutDashboard, page: { type: "admin-dashboard" } as ActivePage },
    { title: "Quản Lý Truyện", icon: BookMarked, page: { type: "admin-stories" } as ActivePage },
    { title: "Quản Lý Chapter", icon: BookOpen, page: { type: "admin-chapters" } as ActivePage },
    { title: "Quản Lý Thể Loại", icon: Layers, page: { type: "admin-categories" } as ActivePage },
    { title: "Quản Lý Độc Giả", icon: Users, page: { type: "admin-users" } as ActivePage }
  ];

  return (
    <aside id="admin-sidebar" className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 flex flex-col justify-between font-sans min-h-[300px] md:min-h-[calc(100vh-4rem)]">
      
      {/* Top action list */}
      <div className="p-4 space-y-6">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 select-none">HỆ THỐNG QUẢN TRỊ</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item, idx) => {
            const isSelected = activePage.type === item.page.type;
            const Icon = item.icon;

            return (
              <button
                key={idx}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isSelected
                    ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.title}</span>
                </div>
                {isSelected && <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Return to homepage menu shortcut item */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={() => onNavigate({ type: "home" })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all text-left"
        >
          <Home className="h-4.5 w-4.5 text-slate-500" />
          <span>Về trang người đọc</span>
        </button>
      </div>

    </aside>
  );
}
