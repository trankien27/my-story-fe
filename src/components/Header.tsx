import React, { useState } from "react";
import { BookOpen, Search, LogIn, User as UserIcon, Settings, LogOut, Clock, Bookmark, Menu, X, Grid, ChevronDown } from "lucide-react";
import { User, ActivePage } from "../types";
import { dbService } from "../services/dbService";

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export default function Header({ currentUser, onLogout, activePage, onNavigate }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(10);
  const [isCatDropdownPinned, setIsCatDropdownPinned] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate({ type: "story-list", search: searchTerm.trim() });
    }
  };

  const allCategories = dbService.getCategories();
  const visibleCategories = allCategories.slice(0, visibleCategoryCount);
  const hasMoreCategories = visibleCategoryCount < allCategories.length;

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate({ type: "home" })}
            className="flex items-center gap-2 text-left focus:outline-none"
          >
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A]">
                Vn<span className="text-[#7C3AED]">Truyen</span>
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate({ type: "home" })}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activePage.type === "home"
                  ? "text-[#7C3AED] bg-[#7C3AED]/10"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
              }`}
            >
              Trang Chủ
            </button>
            <button
              onClick={() => onNavigate({ type: "story-list" })}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activePage.type === "story-list"
                  ? "text-[#7C3AED] bg-[#7C3AED]/10"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
              }`}
            >
              Tất Cả Truyện
            </button>

            {/* Simple Dropdown list for categories on desktop */}
            <div className="relative group">
              <button 
                onClick={() => setIsCatDropdownPinned(!isCatDropdownPinned)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-colors ${
                  isCatDropdownPinned 
                    ? "text-[#7C3AED] bg-[#7C3AED]/10 font-bold" 
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                }`}
              >
                <Grid className="h-4 w-4" />
                Thể Loại
              </button>
              <div className={`absolute top-full left-0 mt-2 w-[680px] rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-2xl ring-1 ring-black/5 animate-fade-in z-50 ${
                isCatDropdownPinned ? "block" : "hidden group-hover:block"
              }`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#7C3AED] rounded-full inline-block"></span>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Danh mục thể loại</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{visibleCategories.length}/{allCategories.length}</span>
                </div>

                {/* Render 10 categories first, then reveal batches lazily */}
                <div className="grid grid-cols-5 gap-2.5">
                  {visibleCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setIsCatDropdownPinned(false);
                        onNavigate({ type: "story-list", categorySlug: cat.slug });
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 border border-slate-100 hover:border-[#7C3AED]/20 transition-all duration-150 truncate block"
                      title={cat.description || cat.name}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                {hasMoreCategories && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setVisibleCategoryCount((count) => count + 10);
                    }}
                    className="mt-3 w-full h-9 rounded-xl bg-slate-50 text-xs font-bold text-[#7C3AED] hover:bg-[#7C3AED]/10 flex items-center justify-center gap-1"
                  >
                    Tải thêm thể loại <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:block flex-1 max-w-sm mx-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm truyện tranh, tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-[#F1F5F9] border-none rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/30 transition-all font-medium text-[#0F172A] placeholder-[#64748B]"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
            <button type="submit" className="hidden">Tìm</button>
          </form>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile search toggle */}
          <button
            onClick={() => onNavigate({ type: "story-list" })}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg md:hidden"
            title="Tìm kiếm"
          >
            <Search className="h-5 w-5" />
          </button>

          {currentUser ? (
            <div className="relative">
              {/* User Avatar & Menu triggers */}
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                  alt={currentUser.fullName}
                  className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                />
                <span className="hidden lg:block text-sm font-semibold text-[#0F172A] max-w-[120px] truncate">
                  {currentUser.fullName}
                </span>
              </button>

              {/* User dropdown list */}
              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowUserDropdown(false)} />
                  <div className="absolute right-0 mt-2 z-40 w-56 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-2xl ring-1 ring-black/5">
                    <div className="px-3 py-2 border-b border-[#E2E8F0] mb-1">
                      <p className="text-xs text-slate-400 font-medium">Đã đăng ký</p>
                      <p className="text-sm font-bold text-[#0F172A] truncate">{currentUser.fullName}</p>
                      <p className="text-xs text-[#64748B] truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate({ type: "history" });
                      }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-slate-100/50 transition-colors"
                    >
                      <Clock className="h-4 w-4 text-[#64748B]" />
                      Lịch Sử Đọc
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate({ type: "favorites" });
                      }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-slate-100/50 transition-colors"
                    >
                      <Bookmark className="h-4 w-4 text-[#64748B]" />
                      Truyện Đã Lưu
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate({ type: "profile" });
                      }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-slate-100/50 transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-[#64748B]" />
                      Hồ Sơ Cá Nhân
                    </button>

                    {currentUser.role === "admin" && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onNavigate({ type: "admin-dashboard" });
                        }}
                        className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#7C3AED] hover:text-[#6D28D9] rounded-lg bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15 transition-colors font-medium mt-1"
                      >
                        <Settings className="h-4 w-4" />
                        Quản Trị Admin
                      </button>
                    )}

                    <div className="border-t border-[#E2E8F0] my-1" />
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng Xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate({ type: "login" })}
              className="flex items-center gap-1.5 px-5 h-10 rounded-full text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-all"
            >
              <LogIn className="h-4 w-4" />
              Đăng Nhập
            </button>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg md:hidden"
            title="Menu"
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-3 shadow-lg">
          <div className="space-y-1">
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onNavigate({ type: "home" });
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Trang Chủ
            </button>
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onNavigate({ type: "story-list" });
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Tất Cả Truyện
            </button>
          </div>

          <div className="border-t border-slate-100/80 pt-2 pb-1.5">
            <span className="text-xs font-semibold text-slate-400 px-3">DANH MỤC THỂ LOẠI</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 px-3 max-h-48 overflow-y-auto">
              {visibleCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    setShowMobileMenu(false);
                    onNavigate({ type: "story-list", categorySlug: cat.slug });
                  }}
                  className="text-left py-1.5 text-xs font-medium text-slate-600 hover:text-[#7C3AED] rounded truncate"
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {hasMoreCategories && (
              <button
                onClick={() => setVisibleCategoryCount((count) => count + 10)}
                className="mx-3 mt-2 text-xs font-bold text-[#7C3AED] flex items-center gap-1"
              >
                Tải thêm <ChevronDown className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
