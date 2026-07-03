import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../../components/ui';
import { roundApi } from '../../api';
import { ArrowLeft, Plus, Wand2, CalendarClock } from 'lucide-react';

const RoundAddPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!time) {
      setMessage(t('round.time_required'));
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await roundApi.create(time);
      setMessage(res.msg_cn || res.msg_en || t('common.success'));
      setTimeout(() => navigate('/round'), 1200);
    } catch (e) {
      setMessage(t('common.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromMiddle = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await roundApi.createFromMiddle();
      setMessage(res.msg_cn || res.msg_en || t('common.success'));
      setTimeout(() => navigate('/round'), 1200);
    } catch (e) {
      setMessage(t('common.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/round')}
          className="p-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-brand-text" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text">{t('round.add_round')}</h1>
          <p className="text-brand-textLight text-sm mt-1">{t('round.add_round_subtitle')}</p>
        </div>
      </header>

      <Card className="p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-brand-text mb-2 block flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-brand-primary" />
            {t('round.round_time')}
          </label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 bg-brand-muted/50 border border-transparent rounded-xl text-sm
              text-brand-text focus:outline-none focus:border-brand-border focus:bg-white transition-all
              [color-scheme:light]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => navigate('/round')}>
            {t('common.cancel')}
          </Button>
          <Button variant="secondary" onClick={handleCreateFromMiddle} loading={loading}>
            <Wand2 className="w-4 h-4" />
            {t('round.from_middle')}
          </Button>
          <Button onClick={handleCreate} loading={loading}>
            <Plus className="w-4 h-4" />
            {t('common.add')}
          </Button>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-sm text-center ${
            message.includes('成功') || message.includes('Succeeded') || message === t('common.success')
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

export default RoundAddPage;
