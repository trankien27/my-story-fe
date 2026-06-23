import { useState } from "react";
import { Users, Shield, ShieldCheck, Mail, Calendar, UserX, UserCheck } from "lucide-react";
import { User, ActivePage } from "../../types";
import { dbService } from "../../services/dbService";

interface UserManagementPageProps {
  onNavigate: (page: ActivePage) => void;
}

export default function UserManagementPage({ onNavigate }: UserManagementPageProps) {
  const [users, setUsers] = useState<User[]>(dbService.getUsers());
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | "admin" | "user">("all");

  const filteredUsers = users.filter((u) => {
    if (selectedRoleFilter === "all") return true;
    return u.role === selectedRoleFilter;
  });

  const handleToggleRole = (userId: string, currentRole: "admin" | "user") => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (confirm(`Bạn có chắc muốn chuyển đổi phân quyền tài khoản này thành "${nextRole === "admin" ? "Cố vấn Quản trị viên" : "Độc giả chuẩn"}"?`)) {
      dbService.updateUserRole(userId, nextRole);
      setUsers(dbService.getUsers());
    }
  };

  return (
    <div id="admin-users-page" className="flex-1 bg-slate-50/50 p-6 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Top bar header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Quản Lý Thành Viên</h1>
            <p className="text-xs text-slate-400 mt-1">Phê chuẩn phân quyền quản lý cho nhóm dịch, rà soát danh sách nhân khẩu VnTruyen.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Lọc theo vai trò:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e: any) => setSelectedRoleFilter(e.target.value)}
              className="h-10 px-3 bg-white border border-slate-205 rounded-xl text-xs font-bold text-slate-650"
            >
              <option value="all">Hiển thị toàn bộ</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="user">Độc giả thường (User)</option>
            </select>
          </div>
        </div>

        {/* Users lists table */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-450 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 pl-6">Thành viên</th>
                  <th className="p-4">Địa chỉ Email</th>
                  <th className="p-4">Quyền hạn hệ thống</th>
                  <th className="p-4">Ngày đăng ký tham gia</th>
                  <th className="p-4 text-right pr-6">Thay đổi quyền bộ lọc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-xs text-slate-650 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/45 transition-colors">
                    
                    {/* User profile details */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                          alt={u.fullName}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-full border border-slate-200 object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800">{u.fullName}</h4>
                          <span className="text-[9px] text-slate-400 font-mono">{u.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email address */}
                    <td className="p-4 text-slate-500 font-semibold flex items-center gap-1.5 py-6">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {u.email}
                    </td>

                    {/* Role badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        u.role === "admin"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      }`}>
                        {u.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {u.role === "admin" ? "QUẢN TRỊ VIÊN" : "ĐỘC GIẢ"}
                      </span>
                    </td>

                    {/* Registration Date */}
                    <td className="p-4 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(u.joinedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </td>

                    {/* Quick role conversion triggers */}
                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          u.role === "admin"
                            ? "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
                            : "bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100"
                        }`}
                      >
                        {u.role === "admin" ? "Bỏ chức Quản trị" : "Thăng cấp Admin"}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
