import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/ui';
import { useUserStore } from '../../store/user';
import { roundApi, trackApi } from '../../api';
import type { RoundInfo, ClanInfo, TrackInfo } from '../../types';
import { timeParse } from '../../api/request';
import {
  Info,
  Calendar,
  Flag,
  ExternalLink,
  Swords,
  CheckCircle2,
  Target,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const user = useUserStore((s) => s.user);
  const { setSidebarOpen } = useSidebar();
  const [lastRound, setLastRound] = useState<RoundInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [regResult, setRegResult] = useState<{ success: boolean; message: string; data?: TrackInfo } | null>(null);
  const [regLoadingId, setRegLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await roundApi.last();
        if (res.data) {
          setLastRound(res.data);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const clans: ClanInfo[] = user?.clans || [];

  const getTypeBadge = (type?: number) => {
    if (type === undefined) return null;
    switch (type) {
      case 0: return <Badge type="default">{t('track.external')}</Badge>;
      case 1: return <Badge type="success">{t('track.internal')}</Badge>;
      case 2: return <Badge>{t('track.alliance')}</Badge>;
      case 11: return <Badge type="warning">{t('track.award')}</Badge>;
      case 12: return <Badge type="error">{t('track.penalty')}</Badge>;
      default: return null;
    }
  };

  const getResultBadge = (result?: number) => {
    if (result === undefined) return null;
    if (result === 1) return <Badge type="success">{t('track.win')}</Badge>;
    if (result === -1) return <Badge type="error">{t('track.lose')}</Badge>;
    return <Badge className="bg-gray-50/80 text-gray-400 border-gray-200/60">{t('track.none')}</Badge>;
  };

  const handleRegister = async (clan: ClanInfo, isLast: boolean) => {
    setRegLoadingId(clan.id + (isLast ? '-last' : '-first'));
    setRegResult(null);
    try {
      const res = await trackApi.create({
        self_tag: clan.tag,
        last: isLast,
      } as any);
      const msg = i18n.language === 'zh_CN' || i18n.language === 'zh_TW' ? res.msg_cn : res.msg_en;
      setRegResult({ success: true, message: msg, data: res.data });
    } catch (e: any) {
      const msg = e?.response?.data?.msg_cn || e?.response?.data?.msg_en || e?.message || t('common.failed');
      setRegResult({ success: false, message: msg });
    } finally {
      setRegLoadingId(null);
    }
  };

  return (
    <div className="min-h-full pb-8">
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <section className="mb-0">
          <div className="flex flex-col items-center text-center relative">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden absolute top-0 left-0 p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
            >
              <Menu className="w-5 h-5 text-brand-text" />
            </button>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary/90 to-brand-glow/90 flex items-center justify-center shadow-xl shadow-brand-primary/25 mb-4">
                <Sparkles className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">
                {t('nav.home')}
              </h1>
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <Link
                to="/home-info"
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-brand-primary bg-white/60 backdrop-blur-sm border border-brand-soft/60 rounded-xl hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <Info className="w-4 h-4" />
                {t('dashboard.point_explanation')}
              </Link>
              <Link
                to="/read-compo"
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-brand-text bg-white/40 backdrop-blur-sm border border-brand-border/60 rounded-xl hover:bg-white/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <Target className="w-4 h-4" />
                {t('nav.read_compo')}
              </Link>
            </div>
          </div>
        </section>
      </div>

      {regResult && (
        <div className={`mb-8 p-5 border-l-4 rounded-r-2xl ${regResult.success ? 'border-l-brand-success bg-green-50/50' : 'border-l-brand-error bg-red-50/50'} animate-slide-down backdrop-blur-sm`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 mt-0.5 ${regResult.success ? 'text-brand-success' : 'text-brand-error'}`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${regResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {regResult.message}
              </p>
              {regResult.data && (
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(regResult.data.type)}
                    {getResultBadge(regResult.data.result)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brand-textLight">
                    <span className="font-medium">{t('track.self')}:</span>
                    <span>{regResult.data.self_name || regResult.data.self_tag || t('common.unknown')}</span>
                    <span className="text-brand-primary font-bold">VS</span>
                    <span>{regResult.data.rival_name || regResult.data.rival_tag || t('common.unknown')}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-brand-textLight">
                    <span>{t('track.history_point')}: {regResult.data.self_history_point} → {regResult.data.self_now_point}</span>
                    <span>{t('track.rival_point')}: {regResult.data.rival_history_point} → {regResult.data.rival_now_point}</span>
                  </div>
                  {regResult.data.round_code && (
                    <div className="flex items-center gap-2 text-xs text-brand-textLight">
                      <span>{t('track.round_code')}: {regResult.data.round_code}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setRegResult(null)}
              className="text-brand-textLight hover:text-brand-text transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Card className="relative overflow-hidden mb-8 animate-slide-up">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-soft/40 to-brand-glow/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-6 lg:p-8">
          {loading ? (
            <div className="flex flex-col gap-2">
              <div className="w-24 h-10 bg-brand-muted/60 rounded-lg animate-pulse" />
              <div className="w-40 h-6 bg-brand-muted/40 rounded animate-pulse" />
              <div className="w-24 h-4 bg-brand-muted/30 rounded animate-pulse" />
            </div>
          ) : lastRound ? (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-glow flex items-center justify-center shadow-xl shadow-brand-primary/25 shrink-0 mt-1">
                  <Calendar className="w-[26px] h-[26px] text-white" strokeWidth={1.5} />
                </div>
                <div className="mb-0.5">
                  <p className="text-xl font-bold text-brand-text">{timeParse(lastRound.round_time)}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <span className="px-3 py-0.5 rounded-lg bg-gradient-to-r from-brand-primary/20 to-brand-glow/10 text-brand-primary font-medium text-xs">
                      {lastRound.code}
                    </span>
                    <span className="text-xs text-brand-textLight">{t('common.create_time')}: {timeParse(lastRound.create_time)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-brand-textLight">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">{t('common.no_data')}</span>
            </div>
          )}
        </div>
      </Card>

      <section className="animate-slide-up">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/20 to-purple-100/50 flex items-center justify-center shrink-0">
            <Flag className="w-5 h-5 text-brand-primary" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-brand-text truncate">{t('dashboard.my_clans')}</h2>
            <p className="text-xs text-brand-textLight">{t('dashboard.clan_subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-medium bg-brand-soft/40 text-brand-primary rounded-full whitespace-nowrap">
              {clans.length}
            </span>
            <span className="text-xs text-brand-textLight hidden sm:inline">{t('clan.total')}</span>
          </div>
        </div>
        
        {clans.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-muted/60 flex items-center justify-center">
              <Flag className="w-8 h-8 text-brand-textLight" strokeWidth={1.5} />
            </div>
            <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
            <Link to="/clan">
              <Button size="sm" className="mt-4">{t('clan.add_clan')}</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {clans.map((clan, index) => (
              <ClanCard
                key={clan.id}
                clan={clan}
                onRegister={handleRegister}
                loading={regLoadingId !== null && (regLoadingId === clan.id + '-first' || regLoadingId === clan.id + '-last')}
                delay={index * 100}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ClanCard = ({
  clan,
  onRegister,
  loading,
  delay,
}: {
  clan: ClanInfo;
  onRegister: (clan: ClanInfo, isLast: boolean) => void;
  loading: boolean;
  delay: number;
}) => {
  const { t } = useTranslation();
  const [isLast, setIsLast] = useState(false);

  const statusConfig = {
    1: { type: 'success' as const, text: t('clan.status_ready') },
    2: { type: 'error' as const, text: t('clan.status_locked') },
    9: { type: 'default' as const, text: t('clan.status_ally') },
    default: { type: 'warning' as const, text: t('clan.status_other') },
  };

  const status = clan.status === 1 || clan.status === 2 || clan.status === 9 
    ? statusConfig[clan.status as keyof typeof statusConfig] 
    : statusConfig.default;

  return (
    <div 
      className="p-5 rounded-2xl border border-brand-border bg-white/80 backdrop-blur-sm hover:border-brand-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
        <div className="min-w-0">
          <Link
            to={`/clan-track/${clan.id}`}
            className="font-semibold text-brand-text hover:text-brand-primary transition-colors inline-flex items-center gap-1 group"
          >
            <span className="truncate">{clan.name}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
          <p className="text-xs text-brand-textLight mt-0.5 font-mono">{clan.tag}</p>
        </div>
        <Badge type={status.type} className="shrink-0">
          {status.text}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs text-brand-textLight">{timeParse(clan.create_time)}</span>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/middle-track/${clan.tag.replace('#', '')}`}
            className="p-2 rounded-lg text-brand-textLight hover:text-brand-text hover:bg-brand-muted/60 transition-colors"
            title={t('track.public_track')}
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setIsLast(!isLast)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              isLast
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-brand-muted text-brand-text border border-brand-border hover:bg-brand-soft/30'
            }`}
          >
            {isLast ? t('common.last') : t('common.first')}
          </button>
          <Button
            size="sm"
            onClick={() => onRegister(clan, isLast)}
            loading={loading}
            className="gap-1"
          >
            <Swords className="w-3.5 h-3.5" />
            {t('common.reg')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;