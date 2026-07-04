import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../store/user';
import { SidebarProvider } from '../contexts/SidebarContext';
import {
  Home,
  Users,
  Flag,
  CircleDot,
  ScrollText,
  Settings,
  LogOut,
  LogIn,
  Globe,
  ChevronDown,
  Swords,
  Calendar,
  History,
  X,
  ChevronRight,
  Search,
} from 'lucide-react';

const LanguageSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'zh_CN', label: t('settings.language_zh_cn') },
    { code: 'zh_TW', label: t('settings.language_zh_tw') },
    { code: 'en', label: t('settings.language_en') },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpen(false);
    if (open) {
      setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`
          flex items-center gap-2 px-3 py-2 text-xs font-medium text-brand-text
          bg-white/60 backdrop-blur-md border border-white/60
          rounded-xl hover:bg-white/80 transition-all shadow-soft
          ${compact ? 'justify-center' : 'w-full'}
        `}
      >
        <Globe className="w-4 h-4 text-brand-primary flex-shrink-0" />
        {!compact && <span className="flex-1 text-left truncate">{currentLang.label}</span>}
        {!compact && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && (
        <div className={`
          absolute ${compact ? 'top-full right-0 mt-2' : 'bottom-full left-0 right-0 mb-2'}
          bg-white/95 backdrop-blur-xl border border-white/70
          rounded-xl shadow-float overflow-hidden z-50
          animate-slide-down min-w-[140px]
        `}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-brand-muted/60 transition-colors ${
                i18n.language === lang.code ? 'text-brand-primary bg-brand-soft/40 font-medium' : 'text-brand-text'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, token } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/clan', label: t('nav.clan'), icon: Flag },
    { to: '/track', label: t('nav.track'), icon: Swords },
    { to: '/round', label: t('nav.round'), icon: Calendar, adminOnly: true },
    { to: '/user', label: t('nav.user'), icon: Users, adminOnly: true },
    { to: '/operate-log', label: t('nav.operate_log'), icon: ScrollText },
    { to: '/login-log', label: t('nav.login_log'), icon: History, adminOnly: true },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin());

  const handleLogout = () => {
    logout();
    navigate('/login');
    setSidebarOpen(false);
  };

  const handleProfile = () => {
    if (user?.id) {
      navigate(`/user-update/${user.id}`);
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <SidebarProvider value={{ isSidebarOpen: sidebarOpen, setSidebarOpen }}>
      <div className="min-h-screen relative">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-soft/30 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl" />
        </div>

        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={`
            fixed top-0 left-0 h-full z-50 w-64
            bg-white/80 backdrop-blur-xl border-r border-white/60
            flex flex-col justify-between
            transition-transform duration-300 ease-out
            lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
        <div className="p-5 overflow-y-auto flex-1">
          <div className="mb-8 px-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary via-brand-glow to-brand-accent flex items-center justify-center shadow-glow shadow-brand-primary/20">
              <CircleDot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">CFA</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-brand-muted/60 transition-colors"
            >
              <X className="w-4 h-4 text-brand-textLight" />
            </button>
          </div>

          {user ? (
            <div
              onClick={handleProfile}
              className="mb-6 p-4 rounded-2xl cursor-pointer group relative overflow-hidden border border-pink-200/50 bg-gradient-to-br from-pink-100/80 via-rose-50/70 to-pink-100/60 hover:from-pink-200/60 hover:to-rose-100/80 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-pink-300/40">
                  <path d="M50 10 C55 25 70 30 75 45 C60 50 55 65 50 80 C45 65 40 50 25 45 C30 30 45 25 50 10" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-2 w-12 h-12 pointer-events-none opacity-50">
                <svg viewBox="0 0 100 100" className="w-full h-full text-rose-300/30">
                  <path d="M50 10 C55 25 70 30 75 45 C60 50 55 65 50 80 C45 65 40 50 25 45 C30 30 45 25 50 10" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute top-8 left-6 w-3 h-3 rounded-full bg-pink-400/30 pointer-events-none blur-[1px]" />
              <div className="absolute bottom-10 right-8 w-2 h-2 rounded-full bg-rose-400/25 pointer-events-none blur-[1px]" />
              
              <div className="relative flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary via-brand-glow to-brand-accent flex items-center justify-center text-white font-bold text-lg mb-3 shadow-lg shadow-pink-300/30 group-hover:shadow-xl group-hover:shadow-pink-400/40 group-hover:scale-105 transition-all duration-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-bold text-brand-text truncate w-full text-center">{user.name}</p>
                <p className="text-[11px] text-brand-textLight truncate mt-0.5 w-full text-center">{user.email}</p>
                {isAdmin() && (
                  <span className="mt-2 px-2.5 py-0.5 text-[10px] font-medium text-pink-600 bg-pink-200/60 rounded-full">
                    {t('nav.user_admin')}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-6 rounded-2xl border border-brand-border/60 bg-gradient-to-br from-brand-soft/20 to-transparent text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-primary/80 via-brand-glow/80 to-brand-accent/80 flex items-center justify-center shadow-glow shadow-brand-primary/20">
                <CircleDot className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm font-semibold text-brand-text mb-1.5">{t('app_name')}</p>
              <p className="text-xs text-brand-textLight leading-relaxed">{t('nav.guest_hint')}</p>
            </div>
          )}

          {!token && (
            <nav className="space-y-1">
              <a
                href="https://www.cocbzlm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-text hover:bg-brand-muted/70 hover:pl-4 transition-all duration-200 group"
              >
                <Search className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                <span className="flex-1">{t('nav.bzlm')}</span>
                <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </a>
            </nav>
          )}

          {token && (
            <nav className="space-y-1">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-primary/15 to-brand-glow/10 text-brand-primary border border-brand-soft/50 shadow-soft'
                        : 'text-brand-text hover:bg-brand-muted/70 hover:pl-4'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        <div className="p-5 border-t border-brand-border/50 space-y-3">
          <LanguageSwitcher />
          {token ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-brand-text hover:bg-rose-50/60 hover:text-brand-error transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={1.8} />
              <span>{t('nav.logout')}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-brand-primary hover:bg-brand-soft/40 transition-all group"
            >
              <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.8} />
              <span>{t('nav.login')}</span>
            </button>
          )}
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <div className="animate-page-enter px-3 sm:px-6 lg:px-8 pb-8">
          {children}
        </div>
      </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
