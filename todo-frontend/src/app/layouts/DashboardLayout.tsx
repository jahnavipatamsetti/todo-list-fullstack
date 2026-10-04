import { useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, CheckSquare, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const initials = (user?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=4F46E5&color=fff&size=128`;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col justify-between">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-sidebar-foreground">TaskFlow</h1>
          </div>
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isActive("/dashboard")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/tasks"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isActive("/tasks")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>Tasks</span>
            </Link>
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                isActive("/settings")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-sidebar-border space-y-4">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/50 transition-all text-left group"
          >
            <Avatar className="w-9 h-9 border border-border shrink-0">
              <AvatarImage src={user?.avatar || defaultAvatarUrl} alt={user?.name || "User"} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate group-hover:text-primary transition-colors">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <Outlet />
    </div>
  );
}
