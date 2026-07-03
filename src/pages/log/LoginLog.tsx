import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Card, Badge } from '../../components/ui';
import { useUserStore } from '../../store/user';
import { logApi } from '../../api';
import type { LoginLogInfo } from '../../types';
import { timeParse } from '../../api/request';
import {
  History,
  Search,
  MapPin,
  Clock,
  User,
  Loader2,
  Menu,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const PAGE_SIZE = 20;

const LoginLogPage = () => {
  const { t } = useTranslation();
  const isAdmin = useUserStore((s) => s.isAdmin());
  const { setSidebarOpen } = useSidebar();
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<LoginLogInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  // 初始加载
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      try {
        if (search) {
          const res = await logApi.loginLog(search);
          setLogs(res.data || []);
          setTotal(res.data ? res.data.length : 0);
          setHasMore(false);
        } else {
          const res = await logApi.loginLogPage(1, PAGE_SIZE);
          setLogs(res.data || []);
          setTotal(res.data_count || 0);
          setHasMore((res.data || []).length === PAGE_SIZE);
        }
      } catch (e) {
        setLogs([]);
        setTotal(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(fetchInitial, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  // 加载更多
  const fetchMore = useCallback(async (pageNum: number) => {
    if (isLoadingRef.current || !hasMore || search) return;

    isLoadingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await logApi.loginLogPage(pageNum, PAGE_SIZE);
      const data = res.data || [];
      // 基于 user_id + login_time 组合键去重
      setLogs((prev) => {
        const existingKeys = new Set(prev.map((l) => `${l.user_id}_${l.login_time}`));
        const newData = data.filter((l) => !existingKeys.has(`${l.user_id}_${l.login_time}`));
        return [...prev, ...newData];
      });
      setTotal(res.data_count || 0);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [hasMore, search]);

  // 滚动监听
  useEffect(() => {
    if (search || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          fetchMore(page + 1);
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [search, hasMore, loading, loadingMore, page, fetchMore]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
            >
              <Menu className="w-5 h-5 text-brand-text" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text">{t('log.login_title')}</h1>
              <p className="text-brand-textLight text-sm mt-1">
                {t('log.login_subtitle')}
                {!search && total > 0 && (
                  <span className="ml-2">
                    ({t('common.pagination.total')} {total} {t('common.pagination.items')})
                  </span>
                )}
              </p>
            </div>
          </div>
        </header>

        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textLight" strokeWidth={1.8} />
            <input
              type="text"
              placeholder={t('user.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-brand-muted/50 border border-transparent rounded-xl text-sm
                focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/30
                focus:bg-white outline-none transition-all text-brand-text
                placeholder:text-brand-textLight"
            />
          </div>
        </Card>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-brand-textLight">{t('common.loading')}</p>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-muted/60 flex items-center justify-center">
            <History className="w-6 h-6 text-brand-textLight" strokeWidth={1.5} />
          </div>
          <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-soft/50 flex items-center justify-center text-sm font-bold text-brand-primary flex-shrink-0">
                    {log.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-brand-text text-base">{log.name}</h4>
                      <Badge type="default">#{log.code}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-brand-textLight">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span className="truncate">{log.address || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>{timeParse(log.login_time)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 瀑布流底部 */}
          {!search && (
            <div ref={observerRef} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-brand-textLight text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.loading')}
                </div>
              )}
              {!loadingMore && !hasMore && total > 0 && (
                <p className="text-xs text-brand-textLight/60">— {t('common.pagination.total')} {total} {t('common.pagination.items')} —</p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default LoginLogPage;
