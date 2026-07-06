import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, InputField, Button } from '../../components/ui';
import { clanApi } from '../../api';
import { ArrowLeft, Wand2, Menu, Flag } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const ClanAddPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSidebarOpen } = useSidebar();
  const [tag, setTag] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuto = !name.trim();

  const handleSubmit = async () => {
    if (!tag.trim()) {
      setMessage(t('clan.tag_required'));
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await clanApi.create({
        tag: tag.trim().toUpperCase(),
        name: isAuto ? undefined : name.trim(),
      });
      if (res > 0) {
        setMessage(t('common.success'));
        setTimeout(() => navigate('/clan'), 800);
      } else {
        setMessage(t('common.failed'));
      }
    } catch (e) {
      setMessage(t('common.failed'));
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2"><Flag className="w-5 h-5 text-brand-primary shrink-0" />{t('clan.add_clan')}</h1>
            <p className="text-brand-textLight text-sm mt-1">{t('clan.add_clan_subtitle')}</p>
          </div>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <InputField
          label={t('clan.clan_tag')}
          placeholder="#ABC123"
          value={tag}
          onChange={(e) => setTag(e.target.value.toUpperCase())}
        />
        <InputField
          label={t('clan.clan_name')}
          placeholder={t('clan.clan_name_placeholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="text-xs text-brand-textLight">
          {t('clan.auto_name_hint')}
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            {t('common.back')}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            className={isAuto ? 'shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/40 animate-pulse-subtle' : ''}
          >
            <Wand2 className="w-4 h-4" />
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

export default ClanAddPage;
