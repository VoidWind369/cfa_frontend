import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, InputField, Button } from '../../components/ui';
import { trackApi } from '../../api';
import { ArrowLeft, Plus, Swords } from 'lucide-react';

const TrackInsertPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selfTag, setSelfTag] = useState('');
  const [rivalTag, setRivalTag] = useState('');
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selfTag.trim() || !rivalTag.trim()) {
      setMessage({ success: false, text: t('track.both_tags_required') });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await trackApi.create({
        self_tag: selfTag.trim().toUpperCase(),
        rival_tag: rivalTag.trim().toUpperCase(),
      } as any);
      const msg = i18n.language === 'zh_CN' || i18n.language === 'zh_TW' ? res.msg_cn : res.msg_en;
      setMessage({ success: true, text: msg });
      setTimeout(() => navigate('/track'), 1200);
    } catch (e: any) {
      const msg = e?.response?.data?.msg_cn || e?.response?.data?.msg_en || e?.message || t('common.failed');
      setMessage({ success: false, text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex items-center gap-4">
          <button
            onClick={() => navigate('/track')}
            className="p-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-brand-text" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2"><Swords className="w-5 h-5 text-brand-primary shrink-0" />{t('track.new_track')}</h1>
            <p className="text-brand-textLight text-sm mt-1">{t('track.insert_subtitle')}</p>
          </div>
        </header>
      </div>

      <Card className="p-6 space-y-5">
        <InputField
          label={t('track.self_tag')}
          value={selfTag}
          onChange={(e) => setSelfTag(e.target.value)}
          placeholder={t('track.self_tag_placeholder')}
        />
        <InputField
          label={t('track.rival_tag')}
          value={rivalTag}
          onChange={(e) => setRivalTag(e.target.value)}
          placeholder={t('track.rival_tag_placeholder')}
        />

        {message && (
          <div className={`p-4 rounded-xl text-sm ${
            message.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} loading={loading} className="flex-1 gap-2">
            <Plus className="w-4 h-4" />
            {t('common.add')}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/track')}>
            {t('common.back')}
          </Button>
        </div>
      </Card>
    </>
  );
};

export default TrackInsertPage;
