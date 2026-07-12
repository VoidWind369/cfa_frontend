import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/ui';
import { useUserStore } from '../../store/user';
import { trackApi } from '../../api';
import type { TrackInfo } from '../../types';
import { timeParse } from '../../api/request';
import {
  Swords,
  Plus,
  Trophy,
  X,
  Clock,
  User,
  Users,
  History,
  ArrowRight,
  Loader2,
  Menu,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const PAGE_SIZE = 20;

const TrackPage = () => {
  const { t } = useTranslation();
  const isAdmin = useUserStore((s) => s.isAdmin());
  const { setSidebarOpen } = useSidebar();
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async (pageNum: number) => {
    if (isLoadingRef.current || !hasMore) return;

    isLoadingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await trackApi.listPage(pageNum, PAGE_SIZE);
      const data = res.data || [];
      // 基于唯一 id 去重
      setTracks((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newData = data.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newData];
      });
      setTotal(res.data_count || 0);
      // 如果返回数据少于 PAGE_SIZE，说明没有更多数据了
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [hasMore]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await trackApi.listPage(1, PAGE_SIZE);
        const data = res.data || [];
        setTracks(data);
        setTotal(res.data_count || 0);
        setHasMore(data.length === PAGE_SIZE);
        setPage(1);
      } catch (e) {
        setTracks([]);
        setTotal(0);
        setHasMore(false);
      } finally {
        setLoading(false);
        initializedRef.current = true;
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!initializedRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    if (page > 1 && hasMore) {
      loadMore(page);
    }
  }, [page, hasMore, loadMore]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const getResultBadge = (result: number) => {
    switch (result) {
      case 1:
        return (
          <Badge type="success">
            <Trophy className="w-3 h-3 mr-1" strokeWidth={2} />
            {t('track.win')}
          </Badge>
        );
      default:
        return (
          <Badge type="error">
            <X className="w-3 h-3 mr-1" strokeWidth={2} />
            {t('track.lose')}
          </Badge>
        );
    }
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

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
            >
              <Menu className="w-5 h-5 text-brand-text" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2"><Swords className="w-5 h-5 text-brand-primary shrink-0" />{t('track.title')}</h1>
              <p className="text-brand-textLight text-sm mt-1">
                {t('track.subtitle')}
                {total > 0 && (
                  <span className="ml-2">
                    ({t('common.pagination.total')} {total} {t('common.pagination.items')})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Link to="/track-insert">
              <Button className="gap-1.5">
                <Plus className="w-4 h-4" strokeWidth={2} />
                  {t('common.add')}
              </Button>
            </Link>
          </div>
        </header>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-brand-textLight">{t('common.loading')}</p>
        </Card>
      ) : tracks.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-muted/60 flex items-center justify-center">
            <Swords className="w-6 h-6 text-brand-textLight" strokeWidth={1.5} />
          </div>
          <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {tracks.map((track) => {
              const selfDiff = track.self_now_point - track.self_history_point;
              const rivalDiff = track.rival_now_point - track.rival_history_point;

              return (
                <Card key={track.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {getResultBadge(track.result as number)}
                      {getTypeBadge(track.type as number)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-brand-textLight">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {timeParse(track.create_time)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brand-text truncate">{track.self_name || track.self_clan_id}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                          {track.self_tag && (
                            <span className="text-xs text-brand-textLight/60 font-mono">{track.self_tag}</span>
                          )}
                          <div className="flex items-center gap-1 text-xs text-brand-textLight">
                            <History className="w-3 h-3 shrink-0" />
                            <span>{track.self_history_point}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="font-medium">{track.self_now_point}</span>
                            {selfDiff !== 0 && (
                              <span className={`font-bold ${selfDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({selfDiff > 0 ? '+' : ''}{selfDiff})
                              </span>
                            )}
                          </div>
                        </div>
                        {track.reward_info && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                            <span>{t('track.reward_history')}: {track.reward_info.self_history}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="font-medium">{track.reward_info.self_now}</span>
                            {track.reward_info.self_history !== track.reward_info.self_now && (
                              <span className={`ml-0.5 font-bold ${track.reward_info.self_now > track.reward_info.self_history ? 'text-green-500' : 'text-red-500'}`}>
                                ({track.reward_info.self_now > track.reward_info.self_history ? '+' : ''}{track.reward_info.self_now - track.reward_info.self_history})
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
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brand-text truncate">{track.rival_name || track.rival_clan_id}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                          {track.rival_tag && (
                            <span className="text-xs text-brand-textLight/60 font-mono">{track.rival_tag}</span>
                          )}
                          <div className="flex items-center gap-1 text-xs text-brand-textLight">
                            <History className="w-3 h-3 shrink-0" />
                            <span>{track.rival_history_point}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="font-medium">{track.rival_now_point}</span>
                            {rivalDiff !== 0 && (
                              <span className={`font-bold ${rivalDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({rivalDiff > 0 ? '+' : ''}{rivalDiff})
                              </span>
                            )}
                          </div>
                        </div>
                        {track.reward_info && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                            <span>{t('track.reward_history')}: {track.reward_info.rival_history}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="font-medium">{track.reward_info.rival_now}</span>
                            {track.reward_info.rival_history !== track.reward_info.rival_now && (
                              <span className={`ml-0.5 font-bold ${track.reward_info.rival_now > track.reward_info.rival_history ? 'text-green-500' : 'text-red-500'}`}>
                                ({track.reward_info.rival_now > track.reward_info.rival_history ? '+' : ''}{track.reward_info.rival_now - track.reward_info.rival_history})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {track.round_code && (
                    <div className="mt-3 pt-3 border-t border-brand-border/50">
                      <Badge type="default">{t('track.round_code')}: {track.round_code}</Badge>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {hasMore && (
            <div ref={observerRef} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-brand-textLight text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.loading')}
                </div>
              )}
            </div>
          )}

          {!hasMore && total > 0 && (
            <div className="py-6 text-center">
              <p className="text-xs text-brand-textLight/60">— {t('common.pagination.total')} {total} {t('common.pagination.items')} —</p>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default TrackPage;
