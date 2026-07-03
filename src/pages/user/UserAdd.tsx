import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, InputField, Button } from '../../components/ui';
import { userApi } from '../../api';
import { ArrowLeft, Plus, Menu } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const UserAddPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSidebarOpen } = useSidebar();
  const [form, setForm] = useState({
    name: '',
    email: '',
    code: '',
    phone: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.code || !form.password) {
      setMessage(t('user.fill_required'));
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await userApi.create({
        name: form.name,
        email: form.email,
        code: form.code,
        phone: form.phone || undefined,
        password: form.password,
        status: 1,
      });
      if (res > 0) {
        setMessage(t('common.success'));
        setTimeout(() => navigate('/user'), 800);
      } else {
        setMessage(t('common.failed'));
      }
    } catch (e) {
      setMessage(t('common.failed'));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
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
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text">{t('user.add_user')}</h1>
            <p className="text-brand-textLight text-sm mt-1">{t('user.add_user_subtitle')}</p>
          </div>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <InputField
          label={t('user.name')}
          placeholder={t('user.name_placeholder')}
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        <InputField
          label={t('user.email')}
          type="email"
          placeholder={t('user.email_placeholder')}
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
        <InputField
          label={t('user.code')}
          placeholder={t('user.code_placeholder')}
          value={form.code}
          onChange={(e) => updateField('code', e.target.value)}
        />
        <InputField
          label={t('user.phone')}
          placeholder={t('user.phone_placeholder')}
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
        <InputField
          label={t('user.password')}
          type="password"
          placeholder={t('user.password_placeholder')}
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('common.back')}
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            <Plus className="w-4 h-4" />
            {t('common.add')}
          </Button>
        </div>
        {message && (
          <div className={`p-3 rounded-xl text-sm text-center ${
            message === t('common.success')
              ? 'bg-green-50 text-green-600 border border-green-100'
              : 'bg-red-50 text-red-500 border border-red-100'
          }`}>
            {message}
          </div>
        )}
      </Card>
    </>
  );
};

export default UserAddPage;
