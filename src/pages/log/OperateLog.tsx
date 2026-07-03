import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge } from '../../components/ui';
import { logApi } from '../../api';
import type { OperateLogInfo } from '../../types';
import { timeParse } from '../../api/request';
import {
  ScrollText,
  Clock,
  Tag,
  User,
  FileText,
  Loader2,
  Menu,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const PAGE_SIZE = 20;

const OperateLogPage = () => {
  const { t } = useTranslation();
  const { setSidebarOpen } = useSidebar();
  const [logs, setLogs] = useState<OperateLogInfo[]>([]);
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
      const res = await logApi.operateLogPage(pageNum, PAGE_SIZE);
      const data = res.data || [];
      // 基于唯一 id 去重
      setLogs((prev) => {
        const existingIds = new Set(prev.map((l) => l.id));
        const newData = data.filter((l) => !existingIds.has(l.id));
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
        const res = await logApi.operateLogPage(1, PAGE_SIZE);
        const data = res.data || [];
        setLogs(data);
        setTotal(res.data_count || 0);
        setHasMore(data.length === PAGE_SIZE);
        setPage(1);
      } catch (e) {
        setLogs([]);
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

  const getRewardTypeText = (type: string) => {
    switch (type) {
      case 'HitExternal': return t('log.hit_external');
      case 'FaceBlack': return t('log.face_black');
      case 'Penalty': return t('log.penalty_1');
      case 'Penalty2': return t('log.penalty_2');
      case 'Penalty3': return t('log.penalty_3');
      default: return type;
    }
  };

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex items-start gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
          >
            <Menu className="w-5 h-5 text-brand-text" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text">{t('log.operate_title')}</h1>
            <p className="text-brand-textLight text-sm mt-1">
              {t('log.operate_subtitle')}
              {total > 0 && (
                <span className="ml-2">
                  ({t('common.pagination.total')} {total} {t('common.pagination.items')})
                </span>
              )}
            </p>
          </div>
        </header>
      </div>

      {loading ? (
          <Card className="overflow-hidden">
            <div className="p-12 text-center">
              <p className="text-brand-textLight">{t('common.loading')}</p>
            </div>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-muted/60 flex items-center justify-center">
                <ScrollText className="w-6 h-6 text-brand-textLight" strokeWidth={1.5} />
              </div>
              <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
            </div>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="divide-y divide-brand-border">
                {logs.map((log) => (
                  <div key={log.id} className="p-5 hover:bg-brand-muted/20 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-stone-500" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-brand-text truncate">{log.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Tag className="w-3 h-3 text-brand-textLight shrink-0" strokeWidth={1.5} />
                          <span className="text-xs text-brand-textLight font-mono">{log.tag}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ml-12">
                      <div className="flex flex-wrap gap-2">
                        <Badge type="default">{getRewardTypeText(log.reward_type as string)}</Badge>
                        <Badge>{log.round_code}</Badge>
                        <Badge type="warning">{log.text}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-brand-textLight">
                        <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                        {timeParse(log.create_time)}
                      </div>
                    </div>
                    {log.remarks && (
                      <div className="mt-3 ml-12 p-3 bg-brand-muted/40 rounded-xl">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-brand-textLight mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-sm text-brand-text">{log.remarks}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

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

export default OperateLogPage;
