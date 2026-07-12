import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button, Select, Badge, ConfirmModal } from '../../components/ui';
import { clanApi, roundApi } from '../../api';
import { useUserStore } from '../../store/user';
import type { ClanInfo, ClanPointInfo, RoundInfo } from '../../types';
import { timeParse } from '../../api/request';
import { ArrowLeft, Save, Trash2, Trophy, Skull, AlertTriangle, Plus, Minus, Clock, Flag } from 'lucide-react';

const ClanEditPage = () => {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const isAdmin = useUserStore((s) => s.isAdmin());
  const [clan, setClan] = useState<ClanInfo | null>(null);
  const [clanPoint, setClanPoint] = useState<ClanPointInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [rounds, setRounds] = useState<RoundInfo[]>([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [rewardType, setRewardType] = useState<number>(0);
  const [rewardMessage, setRewardMessage] = useState('');
  const [rewardSaving, setRewardSaving] = useState(false);
  const [previewRewardPoint, setPreviewRewardPoint] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    const fetchClan = async () => {
      try {
        const data = await clanApi.detail(id);
        setClan(data);
      } catch (e) {
        setMessage(t('common.failed'));
      } finally {
        setLoading(false);
      }
    };
    fetchClan();
  }, [id, t]);

  useEffect(() => {
    const fetchClanPoint = async () => {
      try {
        const data = await clanApi.pointDetail(id);
        setClanPoint(data);
      } catch (e) {
        // ignore
      }
    };
    fetchClanPoint();
  }, [id]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchRounds = async () => {
      try {
        const res = await roundApi.list();
        setRounds(Array.isArray(res) ? res : (res as any).data || []);
      } catch (e) {
        // ignore
      }
    };
    fetchRounds();
  }, [isAdmin]);

  const handleStatusChange = async (status: number) => {
    if (!clan || !isAdmin) return;
    setSaving(true);
    try {
      const res = await clanApi.update({ id: clan.id, status: status as any });
      if (res > 0) {
        setClan({ ...clan, status: status as any });
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

  const handleDelete = async () => {
    if (!clan) return;
    setSaving(true);
    try {
      await clanApi.delete(clan.id);
      navigate('/clan');
    } catch (e) {
      setMessage(t('common.failed'));
      setSaving(false);
    }
  };

  const handleRewardAction = (type: number, pointChange: number) => {
    if (!clanPoint) return;
    setRewardType(type);
    setPreviewRewardPoint(clanPoint.reward_point + pointChange);
    setRewardMessage('');
  };

  const handleRewardSubmit = async () => {
    if (!clan || rewardType === 0 || !selectedRound) return;
    setRewardSaving(true);
    try {
      const res = await clanApi.updateRewardPoint({
        round_id: selectedRound,
        clan_id: clan.id,
        reward_type: rewardType,
      });
      if (res && (res as any).data !== undefined) {
        const newRewardPoint = (res as any).data;
        setClanPoint((prev) => prev ? { ...prev, reward_point: newRewardPoint } : null);
        setClan((prev) => prev ? { ...prev, reward_point: newRewardPoint } : null);
        setPreviewRewardPoint(null);
        setRewardType(0);
        setRewardMessage(t('common.success'));
        setTimeout(() => setRewardMessage(''), 3000);
      } else {
        setRewardMessage(t('common.failed'));
      }
    } catch (e) {
      setRewardMessage(t('common.failed'));
    } finally {
      setRewardSaving(false);
    }
  };

  const statusOptions = [
    { value: '1', label: t('clan.status_ready') },
    { value: '2', label: t('clan.status_locked') },
    { value: '3', label: t('clan.status_other') },
    { value: '4', label: t('clan.status_blacklist') },
    { value: '9', label: t('clan.status_ally') },
  ];

  if (loading) {
    return (
        <Card className="p-12 text-center">
          <p className="text-brand-textLight text-sm">{t('common.loading')}</p>
        </Card>
    );
  }

  if (!clan) {
    return (
        <Card className="p-12 text-center">
          <p className="text-brand-textLight">{t('common.no_data')}</p>
        </Card>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clan')}
            className="p-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-brand-text" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2"><Flag className="w-5 h-5 text-brand-primary shrink-0" />{clan.name || '...'}</h1>
            <p className="text-brand-textLight text-sm mt-1 font-mono">{clan.tag}</p>
          </div>
        </header>
      </div>

      <Card className="p-6 space-y-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-brand-textLight mb-1.5 block">
              {t('clan.clan_tag')}
            </label>
            <p className="text-sm font-medium text-brand-text font-mono">{clan.tag}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-brand-textLight mb-1.5 block">
              {t('clan.clan_name')}
            </label>
            <p className="text-sm font-medium text-brand-text">{clan.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-brand-textLight mb-1.5 block">
              {t('clan.create_time')}
            </label>
            <p className="text-sm text-brand-text">{timeParse(clan.create_time)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-brand-textLight mb-1.5 block">
              {t('clan.update_time')}
            </label>
            <p className="text-sm text-brand-text">{timeParse(clan.update_time)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge type="default">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            {t('common.cfa_point')} {clanPoint?.point ?? clan?.point ?? '-'}
          </Badge>
          <Badge>
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            {t('common.cfa_reward')} {clanPoint?.reward_point ?? clan?.reward_point ?? '-'}
          </Badge>
        </div>

        {clanPoint && (
          <div className="flex items-center gap-2 text-xs text-brand-textLight">
            <Clock className="w-3.5 h-3.5" />
            {t('clan.point_update_time')}: {timeParse(clanPoint.update_time)}
          </div>
        )}

        {isAdmin && (
          <div className="pt-2 border-t border-brand-border">
            <Select
              label={t('clan.clan_status')}
              value={String(clan.status)}
              onChange={(e) => handleStatusChange(Number(e.target.value))}
              disabled={saving}
              options={statusOptions}
            />
          </div>
        )}
      </Card>

      {isAdmin && clan.status === 1 && (
        <Card className="p-6 space-y-5 mb-6">
          <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {t('clan.reward_manage')}
          </h2>

          {clanPoint && rewardType !== 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-brand-surface/50 border border-brand-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-brand-textLight">{t('clan.current_reward')}</p>
                  <p className="text-xl font-bold text-brand-text">
                    {previewRewardPoint !== null ? (
                      <span className="flex items-center gap-2">
                        <span className="text-brand-textLight line-through text-base">{clanPoint.reward_point}</span>
                        <span className={previewRewardPoint > clanPoint.reward_point ? 'text-green-500' : 'text-red-500'}>
                          {previewRewardPoint}
                          <span className="text-sm ml-1">
                            ({previewRewardPoint > clanPoint.reward_point ? '+' : ''}{previewRewardPoint - clanPoint.reward_point})
                          </span>
                        </span>
                      </span>
                    ) : (
                      clanPoint.reward_point
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-brand-textLight mb-1.5 block">
              {t('round.round_select')}
            </label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-surface/50 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 transition-all"
            >
              <option value="">{t('round.please_select')}</option>
              {rounds.map((round) => (
                <option key={round.id} value={round.id}>
                  {round.code}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              onClick={() => handleRewardAction(1, 1)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                rewardType === 1
                  ? 'border-green-400 bg-green-50 shadow-lg shadow-green-200/50'
                  : 'border-brand-border bg-brand-surface hover:border-green-300 hover:bg-green-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  rewardType === 1 ? 'bg-green-500' : 'bg-green-100'
                }`}>
                  <Trophy className={`w-5 h-5 ${rewardType === 1 ? 'text-white' : 'text-green-600'}`} />
                </div>
                <span className="text-xs font-medium text-brand-text whitespace-nowrap">{t('clan.hit_external')}</span>
                <span className="text-xs font-bold text-green-500 flex items-center whitespace-nowrap">
                  <Plus className="w-3 h-3" />1
                </span>
              </div>
            </button>

            <button
              onClick={() => handleRewardAction(2, 1)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                rewardType === 2
                  ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-200/50'
                  : 'border-brand-border bg-brand-surface hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  rewardType === 2 ? 'bg-amber-500' : 'bg-amber-100'
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${rewardType === 2 ? 'text-white' : 'text-amber-600'}`} />
                </div>
                <span className="text-xs font-medium text-brand-text whitespace-nowrap">{t('clan.face_black')}</span>
                <span className="text-xs font-bold text-green-500 flex items-center whitespace-nowrap">
                  <Plus className="w-3 h-3" />1
                </span>
              </div>
            </button>

            <button
              onClick={() => handleRewardAction(31, -1)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                rewardType === 31
                  ? 'border-red-400 bg-red-50 shadow-lg shadow-red-200/50'
                  : 'border-brand-border bg-brand-surface hover:border-red-300 hover:bg-red-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  rewardType === 31 ? 'bg-red-500' : 'bg-red-100'
                }`}>
                  <Skull className={`w-5 h-5 ${rewardType === 31 ? 'text-white' : 'text-red-600'}`} />
                </div>
                <span className="text-xs font-medium text-brand-text whitespace-nowrap">{t('clan.penalty')}1</span>
                <span className="text-xs font-bold text-red-500 flex items-center whitespace-nowrap">
                  <Minus className="w-3 h-3" />1
                </span>
              </div>
            </button>

            <button
              onClick={() => handleRewardAction(32, -2)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                rewardType === 32
                  ? 'border-red-400 bg-red-50 shadow-lg shadow-red-200/50'
                  : 'border-brand-border bg-brand-surface hover:border-red-300 hover:bg-red-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  rewardType === 32 ? 'bg-red-500' : 'bg-red-100'
                }`}>
                  <Skull className={`w-5 h-5 ${rewardType === 32 ? 'text-white' : 'text-red-600'}`} />
                </div>
                <span className="text-xs font-medium text-brand-text whitespace-nowrap">{t('clan.penalty')}2</span>
                <span className="text-xs font-bold text-red-500 flex items-center whitespace-nowrap">
                  <Minus className="w-3 h-3" />2
                </span>
              </div>
            </button>

            <button
              onClick={() => handleRewardAction(33, -3)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                rewardType === 33
                  ? 'border-red-400 bg-red-50 shadow-lg shadow-red-200/50'
                  : 'border-brand-border bg-brand-surface hover:border-red-300 hover:bg-red-50/50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  rewardType === 33 ? 'bg-red-500' : 'bg-red-100'
                }`}>
                  <Skull className={`w-5 h-5 ${rewardType === 33 ? 'text-white' : 'text-red-600'}`} />
                </div>
                <span className="text-xs font-medium text-brand-text whitespace-nowrap">{t('clan.penalty')}3</span>
                <span className="text-xs font-bold text-red-500 flex items-center whitespace-nowrap">
                  <Minus className="w-3 h-3" />3
                </span>
              </div>
            </button>
          </div>

          {rewardType !== 0 && (
            <div className="pt-3 border-t border-brand-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-textLight">
                  {t('clan.confirm_reward')}: <span className="font-medium text-brand-text">
                    {rewardType === 1 && t('clan.hit_external')}
                    {rewardType === 2 && t('clan.face_black')}
                    {rewardType === 31 && t('log.penalty_1')}
                    {rewardType === 32 && t('log.penalty_2')}
                    {rewardType === 33 && t('log.penalty_3')}
                  </span>
                </span>
                <Button
                  onClick={handleRewardSubmit}
                  loading={rewardSaving}
                  disabled={!selectedRound}
                  size="sm"
                >
                  <Save className="w-4 h-4" />
                  {t('common.confirm')}
                </Button>
              </div>
              {rewardMessage && (
                <p className={`mt-2 text-xs ${
                  rewardMessage === t('common.success') ? 'text-green-500' : 'text-red-500'
                }`}>
                  {rewardMessage}
                </p>
              )}
              {!selectedRound && rewardType && (
                <p className="mt-2 text-xs text-amber-500">
                  {t('clan.please_select_round')}
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      {isAdmin && (
        <div className="flex justify-between">
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            <Trash2 className="w-4 h-4" />
            {t('common.delete')}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/clan')}>
              {t('common.back')}
            </Button>
            <Button onClick={() => navigate('/clan')} loading={saving}>
              <Save className="w-4 h-4" />
              {t('common.save')}
            </Button>
          </div>
        </div>
      )}

      {message && (
        <div className={`mt-4 p-3 rounded-xl text-sm text-center ${
          message === t('common.success')
            ? 'bg-green-50 text-green-600 border border-green-100'
            : 'bg-red-50 text-red-500 border border-red-100'
        }`}>
          {message}
        </div>
      )}

      <ConfirmModal
        open={deleteModal}
        title={t('common.delete')}
        message={t('clan.confirm_delete')}
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </>
  );
};

export default ClanEditPage;
