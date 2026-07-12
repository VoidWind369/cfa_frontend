import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Badge } from '../../components/ui';
import { trackApi, clanApi } from '../../api';
import type { TrackInfo, ClanInfo } from '../../types';
import { timeParse } from '../../api/request';
import {
  ArrowLeft,
  ArrowRight,
  Swords,
  Trophy,
  Award,
  AlertTriangle,
  Minus,
  Flag,
  History,
  Menu,
  Skull,
  Handshake,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const ClanTrackPage = () => {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { setSidebarOpen } = useSidebar();
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [clan, setClan] = useState<ClanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trackData, clanData] = await Promise.all([
          trackApi.clanTrack(id),
          clanApi.detail(id),
        ]);
        setTracks(trackData);
        setClan(clanData);
      } catch (e) {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const counts = {
    win: tracks.filter((t) => t.result === 1).length,
    lose: tracks.filter((t) => t.result === -1).length,
    award: tracks.filter((t) => t.type === 11 && t.result === 1).length,
    penalty: tracks.filter((t) => t.type === 12 && t.result === -1).length,
    other: tracks.filter((t) => t.type === 0 || t.type === 2 || (t.type === 11 && t.result !== 1) || (t.type === 12 && t.result !== -1)).length,
  };

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 0: return <Badge type="default">{t('track.external')}</Badge>;
      case 1: return <Badge type="success">{t('track.internal')}</Badge>;
      case 2: return <Badge>{t('track.alliance')}</Badge>;
      case 11: return <Badge type="warning">{t('track.award')}</Badge>;
      case 12: return <Badge type="error">{t('track.penalty')}</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const getResultIcon = (result: number) => {
    switch (result) {
      case 1: return <Trophy className="w-5 h-5" />;
      case -1: return <Skull className="w-5 h-5" />;
      default: return <Handshake className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors shrink-0"
            >
              <Menu className="w-5 h-5 text-brand-text" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl hover:bg-brand-muted/60 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-brand-text" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2">
                <Flag className="w-5 h-5 text-brand-primary shrink-0" />
                <span className="truncate">{clan?.name || '...'}</span>
              </h1>
              <p className="text-brand-textLight text-xs mt-0.5 font-mono truncate">
                {clan?.tag} · {t('track.title')}
              </p>
            </div>
          </div>
        </header>

        <Card className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100">
              <Trophy className="w-5 h-5 mx-auto mb-1.5 text-green-500" />
              <p className="text-xl font-bold text-green-600">{counts.win}</p>
              <p className="text-xs text-green-500">{t('track.win')}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-red-50 border border-red-100">
              <Minus className="w-5 h-5 mx-auto mb-1.5 text-red-400" />
              <p className="text-xl font-bold text-red-500">{counts.lose}</p>
              <p className="text-xs text-red-400">{t('track.lose')}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
              <Award className="w-5 h-5 mx-auto mb-1.5 text-amber-500" />
              <p className="text-xl font-bold text-amber-600">{counts.award}</p>
              <p className="text-xs text-amber-500">{t('track.award')}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-rose-50 border border-rose-100">
              <AlertTriangle className="w-5 h-5 mx-auto mb-1.5 text-rose-500" />
              <p className="text-xl font-bold text-rose-500">{counts.penalty}</p>
              <p className="text-xs text-rose-400">{t('track.penalty')}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
              <Swords className="w-5 h-5 mx-auto mb-1.5 text-gray-400" />
              <p className="text-xl font-bold text-gray-500">{counts.other}</p>
              <p className="text-xs text-gray-400">{t('track.other') || 'Other'}</p>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-brand-textLight">{t('common.loading')}</p>
        </Card>
      ) : tracks.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-brand-muted/60 flex items-center justify-center">
            <Swords className="w-5 h-5 text-brand-textLight" strokeWidth={1.5} />
          </div>
          <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => {
            const self = {
              name: track.self_name || track.self_clan_id,
              tag: track.self_tag,
              historyPoint: track.self_history_point,
              nowPoint: track.self_now_point,
              rewardHistory: track.reward_info?.self_history,
              rewardNow: track.reward_info?.self_now,
            };
            const rival = {
              name: track.rival_name || track.rival_clan_id,
              tag: track.rival_tag,
              historyPoint: track.rival_history_point,
              nowPoint: track.rival_now_point,
              rewardHistory: track.reward_info?.rival_history,
              rewardNow: track.reward_info?.rival_now,
            };

            const selfColor = track.result === 1 ? 'green' : track.result === -1 ? 'red' : 'gray';
            const rivalColor = track.result === 1 ? 'red' : track.result === -1 ? 'green' : 'gray';

            const selfDiff = self.nowPoint - self.historyPoint;
            const rivalDiff = rival.nowPoint - rival.historyPoint;

            return (
              <Card key={track.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(track.type)}
                  </div>
                  <span className="text-xs text-brand-textLight">
                    {timeParse(track.create_time)}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selfColor === 'green' ? 'bg-green-100 text-green-600' : selfColor === 'red' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                      {getResultIcon(track.result)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${selfColor === 'green' ? 'text-green-600' : selfColor === 'red' ? 'text-red-500' : 'text-brand-text'}`}>
                        {self.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                        {self.tag && (
                          <span className="text-xs text-brand-textLight/60 font-mono">{self.tag}</span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-brand-textLight">
                          <History className="w-3 h-3 shrink-0" />
                          <span>{self.historyPoint}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-medium">{self.nowPoint}</span>
                          {selfDiff !== 0 && (
                            <span className={`font-bold ${selfDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ({selfDiff > 0 ? '+' : ''}{selfDiff})
                            </span>
                          )}
                        </div>
                      </div>
                      {track.reward_info && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                          <span>{t('track.reward_history')}: {self.rewardHistory}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-medium">{self.rewardNow}</span>
                          {self.rewardHistory !== self.rewardNow && (
                            <span className={`ml-0.5 font-bold ${(self.rewardNow!) > (self.rewardHistory!) ? 'text-green-500' : 'text-red-500'}`}>
                              ({(self.rewardNow!) > (self.rewardHistory!) ? '+' : ''}{(self.rewardNow!) - (self.rewardHistory!)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-1">
                    <div className="w-full h-px bg-brand-border/50 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-brand-surface border-2 border-brand-border flex items-center justify-center">
                          <Swords className="w-3 h-3 text-brand-textLight" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rivalColor === 'green' ? 'bg-green-100 text-green-600' : rivalColor === 'red' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                      {getResultIcon(-track.result)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${rivalColor === 'green' ? 'text-green-600' : rivalColor === 'red' ? 'text-red-500' : 'text-brand-text'}`}>
                        {rival.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                        {rival.tag && (
                          <span className="text-xs text-brand-textLight/60 font-mono">{rival.tag}</span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-brand-textLight">
                          <History className="w-3 h-3 shrink-0" />
                          <span>{rival.historyPoint}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-medium">{rival.nowPoint}</span>
                          {rivalDiff !== 0 && (
                            <span className={`font-bold ${rivalDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ({rivalDiff > 0 ? '+' : ''}{rivalDiff})
                            </span>
                          )}
                        </div>
                      </div>
                      {track.reward_info && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                          <span>{t('track.reward_history')}: {rival.rewardHistory}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-medium">{rival.rewardNow}</span>
                          {rival.rewardHistory !== rival.rewardNow && (
                            <span className={`ml-0.5 font-bold ${(rival.rewardNow!) > (rival.rewardHistory!) ? 'text-green-500' : 'text-red-500'}`}>
                              ({(rival.rewardNow!) > (rival.rewardHistory!) ? '+' : ''}{(rival.rewardNow!) - (rival.rewardHistory!)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {track.round_code && (
                  <div className="mt-3 pt-3 border-t border-brand-border/50 flex flex-wrap items-center gap-2 text-xs text-brand-textLight">
                    <span>{t('track.round_code')}: {track.round_code}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};

export default ClanTrackPage;
