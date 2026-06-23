import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { ActivePage, User } from "./types";
import { dbService } from "./services/dbService";
import { apiService } from "./services/apiService";

// Headers, Bottom Nav, Footers
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import AdminSidebar from "./components/AdminSidebar";

// Public pages
import HomePage from "./pages/HomePage";
import StoryListPage from "./pages/StoryListPage";
import StoryDetailPage from "./pages/StoryDetailPage";
import ChapterReaderPage from "./features/reader/pages/ChapterReaderPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HistorySavedPage from "./pages/HistorySavedPage";
import ProfilePage from "./pages/ProfilePage";

// Admin pages
import DashboardPage from "./pages/admin/DashboardPage";
import StoryManagementPage from "./pages/admin/StoryManagementPage";
import ChapterManagementPage from "./pages/admin/ChapterManagementPage";
import CategoryManagementPage from "./pages/admin/CategoryManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";

import { AlertCircle, CheckCircle2 } from "lucide-react";

// Bidirectional helper mapping: ActivePage -> Browser Path
export function getPathFromPage(page: ActivePage): string {
  switch (page.type) {
    case "home":
      return "/";
    case "story-list": {
      const params = new URLSearchParams();
      if (page.categorySlug) params.set("category", page.categorySlug);
      if (page.statusFilter) params.set("status", page.statusFilter);
      if (page.search) params.set("search", page.search);
      const query = params.toString();
      return `/stories${query ? `?${query}` : ""}`;
    }
    case "story-detail":
      return `/stories/${page.slug}`;
    case "reader":
      return `/stories/${page.storySlug}/chapters/${page.chapterNumber}`;
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "profile":
      return "/profile";
    case "history":
      return "/history";
    case "favorites":
      return "/favorites";
    case "admin-dashboard":
      return "/admin/dashboard";
    case "admin-stories":
      return "/admin/stories";
    case "admin-chapters":
      return "/admin/chapters";
    case "admin-categories":
      return "/admin/categories";
    case "admin-users":
      return "/admin/users";
    default:
      return "/";
  }
}

// Bidirectional helper mapping: Browser Route -> ActivePage
export function useActivePageFromRoute(): ActivePage {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pathname = location.pathname;

  if (pathname === "/") return { type: "home" };
  if (pathname === "/login") return { type: "login" };
  if (pathname === "/register") return { type: "register" };
  if (pathname === "/profile") return { type: "profile" };
  if (pathname === "/history") return { type: "history" };
  if (pathname === "/favorites") return { type: "favorites" };
  if (pathname === "/admin" || pathname === "/admin/dashboard") return { type: "admin-dashboard" };
  if (pathname === "/admin/stories") return { type: "admin-stories" };
  if (pathname === "/admin/chapters") return { type: "admin-chapters" };
  if (pathname === "/admin/categories") return { type: "admin-categories" };
  if (pathname === "/admin/users") return { type: "admin-users" };

  // check story-list
  if (pathname === "/stories" || pathname === "/stories/") {
    return {
      type: "story-list",
      categorySlug: searchParams.get("category") || undefined,
      statusFilter: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    };
  }

  // check reader: /stories/:storySlug/chapters/:chapterNumber
  const readerRegex = /^\/stories\/([^/]+)\/chapters\/([^/]+)\/?$/;
  const readerMatch = pathname.match(readerRegex);
  if (readerMatch) {
    return {
      type: "reader",
      storySlug: readerMatch[1],
      chapterNumber: parseInt(readerMatch[2], 10) || 1,
    };
  }

  // check story-detail: /stories/:slug
  const detailRegex = /^\/stories\/([^/]+)\/?$/;
  const detailMatch = pathname.match(detailRegex);
  if (detailMatch) {
    return {
      type: "story-detail",
      slug: detailMatch[1],
    };
  }

  return { type: "home" };
}

// Route parameters adapter wrappers to keep legacy views perfectly functional
function StoryListPageRouteWrapper({ onNavigate }: { onNavigate: (page: ActivePage) => void }) {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || undefined;
  const categorySlug = searchParams.get("category") || undefined;

  return (
    <div key={`${search}-${categorySlug}`}>
      <StoryListPage
        initialSearch={search}
        initialCategorySlug={categorySlug}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function StoryDetailPageRouteWrapper({ onNavigate }: { onNavigate: (page: ActivePage) => void }) {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div key={slug}>
      <StoryDetailPage slug={slug || ""} onNavigate={onNavigate} />
    </div>
  );
}

function ReaderPageRouteWrapper({ onNavigate }: { onNavigate: (page: ActivePage) => void }) {
  const { storySlug, chapterNumber } = useParams<{ storySlug: string; chapterNumber: string }>();
  const num = parseInt(chapterNumber || "1", 10) || 1;
  return (
    <div key={`${storySlug}-${num}`}>
      <ChapterReaderPage
        storySlug={storySlug || ""}
        chapterNumber={num}
        onNavigate={onNavigate}
      />
    </div>
  );
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (apiService.hasSession()) {
      setCurrentUser(dbService.getCurrentUser());
    } else {
      dbService.setCurrentUser(null);
    }

    apiService
      .loadCatalog(dbService.getStories())
      .then(({ categories, stories }) => {
        dbService.hydrateCatalog(categories, stories);
        setDataVersion((value) => value + 1);
      })
      .catch((error: Error) => {
        triggerAlert(error.message, "error");
      });
  }, []);

  const handleLogout = () => {
    apiService.logout();
    dbService.setCurrentUser(null);
    setCurrentUser(null);
    triggerAlert("Bạn đã đăng xuất tài khoản thành công!", "success");
    navigate("/");
  };

  const handleLoginSuccess = () => {
    const user = dbService.getCurrentUser();
    setCurrentUser(user);
    triggerAlert(`Chào mừng quay trở lại, ${user ? user.fullName : "Độc giả"}!`, "success");
    if (user && user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleRegisterSuccess = () => {
    setCurrentUser(dbService.getCurrentUser());
    triggerAlert("Đăng ký tài khoản độc giả mới thành công!", "success");
    navigate("/");
  };

  const triggerAlert = (message: string, type: "success" | "error" = "success") => {
    setAlertInfo({ message, type });
    setTimeout(() => {
      setAlertInfo(null);
    }, 4000);
  };

  const activePage = useActivePageFromRoute();
  const isReaderView = activePage.type === "reader";
  const isAdminView = activePage.type.startsWith("admin-");

  const handleNavigate = (page: ActivePage) => {
    navigate(getPathFromPage(page));
  };

  return (
    <div key={dataVersion} className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-indigo-100 relative">
      
      {/* Dynamic persistent alert box */}
      {alertInfo && (
        <div className="fixed top-20 right-4 z-50 animate-bounce p-4 rounded-2xl bg-white border border-slate-100 shadow-2xl flex items-center gap-2.5 max-w-sm">
          {alertInfo.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          )}
          <span className="text-xs font-bold text-slate-700">{alertInfo.message}</span>
        </div>
      )}

      {/* ReaderLayout (distraction free continuous script) */}
      {isReaderView ? (
        <div id="reader-layout" className="flex-1">
          <Routes>
            <Route
              path="/stories/:storySlug/chapters/:chapterNumber"
              element={<ReaderPageRouteWrapper onNavigate={handleNavigate} />}
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      ) : isAdminView ? (
        /* AdminLayout (sidebar + topbar + clean table contents) */
        <div id="admin-layout" className="flex flex-col min-h-screen">
          <Header
            currentUser={currentUser}
            onLogout={handleLogout}
            activePage={activePage}
            onNavigate={handleNavigate}
          />
          <div className="flex-1 flex flex-col md:flex-row">
            <AdminSidebar activePage={activePage} onNavigate={handleNavigate} />
            <div className="flex-1 flex flex-col overflow-x-hidden">
              <Routes>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<DashboardPage onNavigate={handleNavigate} />} />
                <Route path="/admin/stories" element={<StoryManagementPage onNavigate={handleNavigate} />} />
                <Route path="/admin/chapters" element={<ChapterManagementPage onNavigate={handleNavigate} />} />
                <Route path="/admin/categories" element={<CategoryManagementPage onNavigate={handleNavigate} />} />
                <Route path="/admin/users" element={<UserManagementPage onNavigate={handleNavigate} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        /* PublicLayout (headers + visual hero main container + footer + bottom touch navs) */
        <div id="public-layout" className="flex flex-col min-h-screen">
          <Header
            currentUser={currentUser}
            onLogout={handleLogout}
            activePage={activePage}
            onNavigate={handleNavigate}
          />
          
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage currentUser={currentUser} onNavigate={handleNavigate} />} />
              <Route path="/stories" element={<StoryListPageRouteWrapper onNavigate={handleNavigate} />} />
              <Route path="/stories/:slug" element={<StoryDetailPageRouteWrapper onNavigate={handleNavigate} />} />
              <Route
                path="/login"
                element={<LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />}
              />
              <Route
                path="/register"
                element={<RegisterPage onNavigate={handleNavigate} onRegisterSuccess={handleRegisterSuccess} />}
              />
              <Route
                path="/profile"
                element={
                  <ProfilePage
                    currentUser={currentUser}
                    onNavigate={handleNavigate}
                    onUpdateSuccess={() => triggerAlert("Cập nhật thông tin thành hồ sơ độc giả thành công!", "success")}
                  />
                }
              />
              <Route path="/history" element={<HistorySavedPage initialTab="history" onNavigate={handleNavigate} />} />
              <Route path="/favorites" element={<HistorySavedPage initialTab="saved" onNavigate={handleNavigate} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <Footer />

          {/* Touch navigation support for mobile viewports */}
          <BottomNav activePage={activePage} onNavigate={handleNavigate} currentUser={currentUser} />
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
