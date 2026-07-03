import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, InputField } from '../../components/ui';
import { Globe, CircleDot, Sparkles, Shield, Zap, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api';
import { useUserStore } from '../../store/user';

const REMEMBERED_EMAIL_KEY = 'cfa_remembered_email';
const REMEMBERED_PASSWORD_KEY = 'cfa_remembered_password';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { i18n, t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'zh_CN', label: t('settings.language_zh_cn') },
    { code: 'zh_TW', label: t('settings.language_zh_tw') },
    { code: 'en', label: t('settings.language_en') },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    setLangOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setLangOpen(false);
    if (langOpen) {
      setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [langOpen]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-soft/40 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-brand-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-brand-text bg-white/60 backdrop-blur-md border border-white/60 rounded-xl hover:bg-white/80 transition-all shadow-soft"
          >
            <Globe className="w-4 h-4 text-brand-primary" />
            <span className="hidden sm:inline">{currentLang.label}</span>
          </button>
          {langOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/70 rounded-xl shadow-float overflow-hidden z-50 min-w-[140px] animate-slide-down">
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
      </div>

      <div className="w-full max-w-md relative z-10 animate-page-enter">
        {children}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  // 页面加载时读取保存的账号密码
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    const savedPassword = localStorage.getItem(REMEMBERED_PASSWORD_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setPassword(savedPassword || '');
      setRemember(true);
    }
  }, []);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = t('auth.email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.email_invalid');
    }
    if (!password) {
      newErrors.password = t('auth.password_required');
    } else if (password.length < 6) {
      newErrors.password = t('auth.password_min');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const userData = await authApi.login(email, password);
      if (userData && userData.token) {
        if (remember) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
          localStorage.setItem(REMEMBERED_PASSWORD_KEY, password);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
          localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
        }
        setUser(userData);
        navigate('/');
      } else {
        setErrors({ general: t('auth.login_failed') });
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrors({ general: t('auth.login_failed') });
      } else {
        setErrors({ general: t('auth.response_error') });
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Shield, text: t('auth.secure_login') },
    { icon: Zap, text: t('auth.fast_track') },
    { icon: Sparkles, text: t('auth.smart_system') },
  ];

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-primary via-brand-glow to-brand-accent flex items-center justify-center shadow-glow shadow-brand-primary/30 animate-float">
          <CircleDot className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">CFA</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-brand-text">{t('auth.login_title')}</h2>
        <p className="text-brand-textLight text-sm mt-2">{t('auth.login_subtitle')}</p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-card">
        <form onSubmit={handleSubmit} className="space-y-1">
          {errors.general && (
            <div className="mb-5 p-4 bg-rose-50/90 border border-rose-200/80 rounded-2xl backdrop-blur-sm animate-slide-down flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-rose-600">{errors.general}</p>
                <p className="text-xs text-rose-400 mt-1">{t('auth.login_failed_hint')}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrors({})}
                className="p-1 rounded-lg hover:bg-rose-100 transition-colors text-rose-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <InputField
            label={t('auth.email')}
            type="email"
            placeholder={t('auth.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <InputField
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-lg text-brand-textLight hover:text-brand-text hover:bg-brand-muted/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* 记住我 - 使用与整体风格统一的玻璃拟态开关 */}
          <div className="flex items-center justify-between py-4 mt-2">
            <button
              type="button"
              role="switch"
              aria-checked={remember}
              onClick={() => setRemember(!remember)}
              className={`
                relative inline-flex h-5 w-9 items-center rounded-full
                transition-all duration-300 ease-out
                focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 focus:ring-offset-transparent
                ${remember ? 'bg-gradient-to-r from-brand-primary to-brand-glow' : 'bg-brand-border/80'}
              `}
            >
              <span
                className={`
                  inline-block h-3.5 w-3.5 transform rounded-full
                  bg-white shadow-sm
                  transition-transform duration-300 ease-out
                  ${remember ? 'translate-x-5' : 'translate-x-1'}
                `}
              />
            </button>
            <span className="text-xs text-brand-textLight ml-2">{t('auth.remember_me')}</span>

            <a href="#" className="text-xs text-brand-primary font-medium hover:underline hover:text-brand-primaryHover transition-colors ml-auto">
              {t('auth.forgot_password')}
            </a>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {loading ? t('common.loading') : t('auth.login_button')}
          </Button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-brand-textLight">
            <feature.icon className="w-3.5 h-3.5 text-brand-primary/70" strokeWidth={2} />
            <span>{feature.text}</span>
          </div>
        ))}
      </div>
    </AuthLayout>
  );
};

export default LoginPage;