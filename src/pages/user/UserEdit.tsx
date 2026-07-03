import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, InputField, Button, Select } from '../../components/ui';
import { userApi } from '../../api';
import { useUserStore } from '../../store/user';
import { timeParse } from '../../api/request';
import type { UserInfo } from '../../types';
import { ArrowLeft, Save, Menu, User } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const UserEditPage = () => {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const isAdmin = useUserStore((s) => s.isAdmin());
  const { setSidebarOpen } = useSidebar();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userApi.detail(id);
        setUser(data);
      } catch (e) {
        setMessage(t('common.failed'));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, t]);

  const handleSave = async () => {
    if (!user) return;
    if (password && password !== rePassword) {
      setMessage(t('user.password_mismatch'));
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const updateData: Partial<UserInfo> = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };
      if (isAdmin) {
        updateData.code = user.code;
        updateData.status = user.status;
      }
      if (password) {
        updateData.password = password;
      }
      const res = await userApi.update(updateData);
      if (res > 0) {
        setMessage(t('common.success'));
      } else {
        setMessage(t('common.failed'));
      }
    } catch (e) {
      setMessage(t('common.failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <Card className="p-12 text-center">
          <p className="text-brand-textLight text-sm">{t('common.loading')}</p>
        </Card>
    );
  }

  if (!user) {
    return (
        <Card className="p-12 text-center">
          <p className="text-brand-textLight">{t('common.no_data')}</p>
        </Card>
    );
  }

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors shrink-0"
            >
              <Menu className="w-5 h-5 text-brand-text" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-brand-muted/60 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-brand-text" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text truncate flex items-center gap-2"><User className="w-5 h-5 text-brand-primary shrink-0" />{user.name || '...'}</h1>
              <p className="text-brand-textLight text-sm mt-1 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-6 space-y-4 mb-6">
        {isAdmin && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-brand-textLight mb-1.5 block">
                {t('user.code')}
              </label>
              <p className="text-sm font-medium text-brand-text font-mono">{user.code}</p>
            </div>
            <div>
              <Select
                label={t('user.status')}
                value={String(user.status ?? 2)}
                onChange={(e) => setUser({ ...user, status: Number(e.target.value) })}
                options={[
                  { value: '1', label: t('user.status_active') },
                  { value: '0', label: t('user.status_inactive') },
                  { value: '2', label: t('user.status_pending') },
                ]}
              />
            </div>
          </div>
        )}

        <InputField
          label={t('user.name')}
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
        {isAdmin && (
          <InputField
            label={t('user.email')}
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        )}
        <InputField
          label={t('user.phone')}
          value={user.phone || ''}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
        />
        <InputField
          label={t('user.new_password')}
          type="password"
          placeholder={t('user.new_password_placeholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password && (
          <InputField
            label={t('user.confirm_password')}
            type="password"
            placeholder={t('user.confirm_password_placeholder')}
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
          />
        )}

        <div className="pt-2 border-t border-brand-border">
          <p className="text-xs text-brand-textLight">
            {t('user.create_time')}: {timeParse(user.create_time)}
          </p>
          <p className="text-xs text-brand-textLight mt-1">
            {t('user.update_time')}: {timeParse(user.update_time)}
          </p>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          {t('common.save')}
        </Button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-xl text-sm text-center ${
          message === t('common.success')
            ? 'bg-green-50 text-green-600 border border-green-100'
            : 'bg-red-50 text-red-500 border border-red-100'
        }`}>
          {message}
        </div>
      )}
    </>
  );
};

export default UserEditPage;
