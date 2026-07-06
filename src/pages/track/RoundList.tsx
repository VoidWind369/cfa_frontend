import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, Button } from '../../components/ui';
import { roundApi } from '../../api';
import type { RoundInfo } from '../../types';
import { timeParse } from '../../api/request';
import {
  Plus,
  CalendarClock,
  Clock,
  AlertCircle,
  Loader2,
  Menu,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const PAGE_SIZE = 20;

const RoundPage = () => {
  const { t } = useTranslation();
  const { setSidebarOpen } = useSidebar();
  const [rounds, setRounds] = useState<RoundInfo[]>([]);
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
      const res = await roundApi.listPage(pageNum, PAGE_SIZE);
      const data = res.data || [];
      // 基于唯一 id 去重
      setRounds((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newData = data.filter((r) => !existingIds.has(r.id));
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
      setLoading(true);
      try {
        const res = await roundApi.listPage(1, PAGE_SIZE);
        const data = res.data || [];
        setRounds(data);
        setTotal(res.data_count || 0);
        setHasMore(data.length === PAGE_SIZE);
        setPage(1);
      } catch (e) {
        setRounds([]);
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
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2"><CalendarClock className="w-5 h-5 text-brand-primary shrink-0" />{t('round.title')}</h1>
              <p className="text-brand-textLight text-sm mt-1">
                {t('round.subtitle')}
                {total > 0 && (
                  <span className="ml-2">
                    ({t('common.pagination.total')} {total} {t('common.pagination.items')})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Link to="/round-insert">
              <Button className="gap-1.5">
                <Plus className="w-4 h-4" strokeWidth={2} />
                  {t('common.add')}
              </Button>
            </Link>
          </div>
        </header>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-brand-textLight">{t('common.loading')}</p>
        </Card>
      ) : rounds.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-muted/60 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-brand-textLight" strokeWidth={1.5} />
          </div>
          <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rounds.map((round, index) => {
              const roundTime = new Date(round.round_time).getTime();
              const isUpcoming = roundTime > Date.now();

              return (
                <Card
                  key={round.id}
                  className="group relative overflow-hidden hover:shadow-card hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-primary via-brand-glow to-brand-accent opacity-60" />

                  <div className="p-6 pt-[22px]">
                    <div className="flex items-start justify-between mb-5">
                      <h3 className="text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
                        {round.code}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isUpcoming ? 'bg-emerald-400' : 'bg-brand-border'}`}
                        />
                        <span className="text-[11px] font-mono text-brand-textLight/30 font-medium">
                          #{rounds.length - index}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-xl bg-brand-muted/60 flex items-center justify-center shrink-0 ring-1 ring-brand-soft/30">
                          <CalendarClock className="w-4 h-4 text-brand-primary" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-brand-textLight/50 font-semibold">
                            {t('round.round_time')}
                          </p>
                          <p className="text-sm font-semibold text-brand-text mt-0.5 break-all leading-snug">
                            {timeParse(round.round_time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-xl bg-brand-muted/40 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-brand-textLight/60" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-brand-textLight/40 font-semibold">
                            {t('round.create_time')}
                          </p>
                          <p className="text-sm text-brand-textLight mt-0.5 break-all leading-snug">
                            {timeParse(round.create_time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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

export default RoundPage;
