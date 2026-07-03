import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, InputField, Select, Button, Toggle } from '../../components/ui';
import { useUserStore } from '../../store/user';
import { userApi } from '../../api';
import { User, Globe, Lock, Bell, Save, Menu, Settings } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useUserStore();
  const { setSidebarOpen } = useSidebar();
  const [name, setName] = useState(user?.name || '');
  const [language, setLanguage] = useState(i18n.language);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const languageOptions = [
    { value: 'zh_CN', label: t('settings.language_zh_cn') },
    { value: 'zh_TW', label: t('settings.language_zh_tw') },
    { value: 'en', label: t('settings.language_en') },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    try {
      await userApi.updateOwn({ id: user.id, name });
      if (user) {
        setUser({ ...user, name });
      }
      alert('Profile saved!');
    } catch (e) {
      alert('Failed to save profile');
    }
  };

  const sectionTitleStyle = "flex items-center gap-2.5 mb-5";
  const sectionIconStyle = "w-5 h-5 text-brand-primary";

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex items-start gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
          >
            <Menu className="w-5 h-5 text-brand-text" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2"><Settings className="w-5 h-5 text-brand-primary shrink-0" />{t('settings.title')}</h1>
            <p className="text-brand-textLight text-sm mt-1">{t('settings.subtitle')}</p>
          </div>
        </header>
      </div>

      <Card className="p-6 mb-6">
        <div className={sectionTitleStyle}>
          <User className={sectionIconStyle} strokeWidth={1.8} />
          <h2 className="text-base font-semibold text-brand-text">{t('settings.profile')}</h2>
        </div>
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-brand-border">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-soft to-brand-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-brand-text">{name || user?.name}</p>
            <p className="text-sm text-brand-textLight">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <InputField
            label={t('settings.profile_name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputField
            label={t('settings.profile_email')}
            type="email"
            value={user?.email || ''}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
        </div>
        <Button onClick={handleSaveProfile} className="mt-2 gap-1.5">
          <Save className="w-4 h-4" strokeWidth={1.8} />
          {t('settings.save_changes')}
        </Button>
      </Card>

      <Card className="p-6 mb-6">
        <div className={sectionTitleStyle}>
          <Globe className={sectionIconStyle} strokeWidth={1.8} />
          <h2 className="text-base font-semibold text-brand-text">{t('settings.language')}</h2>
        </div>
        <Select
          label={t('settings.language_label')}
          options={languageOptions}
          value={language}
          onChange={handleLanguageChange}
          className="max-w-xs"
        />
      </Card>

      <Card className="p-6 mb-6">
        <div className={sectionTitleStyle}>
          <Lock className={sectionIconStyle} strokeWidth={1.8} />
          <h2 className="text-base font-semibold text-brand-text">{t('settings.security')}</h2>
        </div>
        <p className="text-sm font-medium text-brand-text mb-3">{t('settings.change_password')}</p>
        <InputField
          label={t('settings.current_password')}
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <InputField
            label={t('settings.new_password')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <InputField
            label={t('settings.confirm_new_password')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={() => alert('Password changed!')} className="mt-2">
          {t('settings.save_changes')}
        </Button>
      </Card>

      <Card className="p-6">
        <div className={sectionTitleStyle}>
          <Bell className={sectionIconStyle} strokeWidth={1.8} />
          <h2 className="text-base font-semibold text-brand-text">{t('settings.notifications')}</h2>
        </div>
        <div className="divide-y divide-brand-border -my-3">
          <Toggle
            checked={emailNotifications}
            onChange={setEmailNotifications}
            label={t('settings.email_notifications')}
            description={t('settings.email_notifications_desc')}
          />
          <Toggle
            checked={pushNotifications}
            onChange={setPushNotifications}
            label={t('settings.push_notifications')}
            description={t('settings.push_notifications_desc')}
          />
        </div>
      </Card>
    </>
  );
};

export default SettingsPage;
