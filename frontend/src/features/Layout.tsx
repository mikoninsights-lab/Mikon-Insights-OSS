import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Package,
  Calculator,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  KanbanSquare,
  PenLine,
  BarChart3,
  ScrollText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/pipeline', labelKey: 'nav.pipeline', icon: KanbanSquare },
  { path: '/projects', labelKey: 'nav.projects', icon: Briefcase },
  { path: '/expenses', labelKey: 'nav.expenses', icon: CreditCard },
  { path: '/services', labelKey: 'nav.services', icon: Package },
  { path: '/simulator', labelKey: 'nav.simulator', icon: Calculator },
  { path: '/saas-calculator', labelKey: 'nav.saasCalculator', icon: BarChart3 },
  { path: '/ghostwriter', labelKey: 'nav.ghostwriter', icon: PenLine },
  { path: '/audit-log', labelKey: 'nav.auditLog', icon: ScrollText },
];

const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'ca', label: 'CA' },
];

const SIDEBAR_COLLAPSED_KEY = 'mikon_sidebar_collapsed';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const visibleNavItems = navItems.filter((item) => item.path !== '/audit-log' || isAdmin);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-out lg:translate-x-0 lg:static flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-16 w-64" : "lg:w-64 w-64"
        )}
        style={{ background: '#001F54', borderRight: '1px solid rgba(90,155,213,0.2)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={cn(
              "flex items-center gap-3 p-4",
              isCollapsed ? "lg:justify-center lg:px-2" : "px-4"
            )}
            style={{ borderBottom: '1px solid rgba(90,155,213,0.2)' }}
          >
            <img
              src="/logos/isotipo.png"
              alt="Mikon Insights"
              className={cn(
                "flex-shrink-0 object-contain transition-all duration-300",
                isCollapsed ? "lg:w-8 lg:h-8 w-9 h-9" : "w-9 h-9"
              )}
            />
            <div className={cn("transition-all duration-300 overflow-hidden", isCollapsed ? "lg:hidden" : "")}>
              <h1 className="font-heading font-bold text-sm tracking-wide leading-tight">
                <span style={{ color: '#ffffff' }}>MIKON </span>
                <span style={{ color: '#EA711B' }}>INSIGHTS</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                OSS
              </p>
            </div>
            <button
              className="ml-auto lg:hidden"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin", isCollapsed ? "lg:px-2" : "px-4")}>
            <TooltipProvider delayDuration={0}>
              {visibleNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                const label = t(item.labelKey);

                const linkContent = (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "sidebar-nav-item",
                      isCollapsed ? "lg:justify-center lg:px-0" : "",
                      isActive ? "active" : ""
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    <span className={cn("font-medium transition-all duration-300", isCollapsed ? "lg:hidden" : "")}>
                      {label}
                    </span>
                    {isActive && !isCollapsed && <ChevronRight className="w-4 h-4 ml-auto lg:block hidden" />}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <div className="hidden lg:flex">
                          {linkContent}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="hidden lg:block">
                        {label}
                      </TooltipContent>
                      <div className="lg:hidden text-foreground">
                        {linkContent}
                      </div>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </TooltipProvider>
          </nav>

          {/* Collapse toggle button - Desktop only */}
          <div className="hidden lg:block p-2" style={{ borderTop: '1px solid rgba(90,155,213,0.2)' }}>
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('nav.collapse')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs font-semibold uppercase">
          {i18n.language?.slice(0, 2) || 'es'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => i18n.changeLanguage(lang.code)}>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <button 
          className="lg:hidden text-muted-foreground hover:text-foreground p-2"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm">{user?.email?.split('@')[0]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                {t('header.profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return stored === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      <div className="flex-1 flex flex-col min-w-0" style={{ background: 'linear-gradient(155deg, #030C18 0%, #001F54 100%)', backgroundAttachment: 'fixed' }}>
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
