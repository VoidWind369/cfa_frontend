import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/ui';
import { useUserStore } from '../../store/user';
import { clanApi } from '../../api';
import type { ClanInfo } from '../../types';
import { timeParse } from '../../api/request';
import {
  Search,
  Plus,
  Flag,
  Clock,
  Lock,
  Unlock,
  Ban,
  Users,
  Handshake,
  Edit,
  Loader2,
  Menu,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const PAGE_SIZE = 20;

const ClanPage = () => {
  const { t } = useTranslation();
  const isAdmin = useUserStore((s) => s.isAdmin());
  const { setSidebarOpen } = useSidebar();
  const [search, setSearch] = useState('');
  const [clans, setClans] = useState<ClanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async (pageNum: number) => {
    if (isLoadingRef.current || search || !hasMore) return;

    isLoadingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await clanApi.listPage(pageNum, PAGE_SIZE);
      const data = res.data || [];
      // 基于唯一 id 去重
      setClans((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newData = data.filter((c) => !existingIds.has(c.id));
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
  }, [search, hasMore]);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        if (search) {
          const data = await clanApi.search(search);
          setClans(Array.isArray(data) ? data : []);
          setTotal(Array.isArray(data) ? data.length : 0);
        } else {
          const res = await clanApi.listPage(1, PAGE_SIZE);
          setClans(res.data || []);
          setTotal(res.data_count || 0);
          setPage(1);
        }
      } catch (e) {
        setClans([]);
        setTotal(0);
      } finally {
        setLoading(false);
        initializedRef.current = true;
      }
    };
    fetchInitial();
  }, [search]);

  useEffect(() => {
    if (!initializedRef.current || loading || search || !hasMore) return;

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
  }, [loading, loadingMore, search, hasMore]);

  useEffect(() => {
    if (page > 1 && !search && hasMore) {
      loadMore(page);
    }
  }, [page, search, hasMore, loadMore]);

  const counts = {
    ready: clans.filter((c) => c.status === 1).length,
    locked: clans.filter((c) => c.status === 2).length,
    other: clans.filter((c) => c.status === 3).length,
    blacklist: clans.filter((c) => c.status === 4).length,
    ally: clans.filter((c) => c.status === 9).length,
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1: return <Badge type="success">{t('clan.status_ready')}</Badge>;
      case 2: return <Badge type="error">{t('clan.status_locked')}</Badge>;
      case 3: return <Badge type="default">{t('clan.status_other')}</Badge>;
      case 4: return <Badge type="warning">{t('clan.status_blacklist')}</Badge>;
      case 9: return <Badge type="default">{t('clan.status_ally')}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex flex-row items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
            >
              <Menu className="w-5 h-5 text-brand-text" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2"><Flag className="w-5 h-5 text-brand-primary shrink-0" />{t('clan.title')}</h1>
              <p className="text-brand-textLight text-sm mt-1">
                {t('clan.subtitle')}
                {!search && total > 0 && (
                  <span className="ml-2">
                    ({t('common.pagination.total')} {total} {t('common.pagination.items')})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            {isAdmin && (
              <Link to="/clan-add">
                <Button className="gap-1.5">
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  {t('clan.add_clan')}
                </Button>
              </Link>
            )}
          </div>
        </header>

        <Card className="p-4 sm:p-5">
          {/* 5 列网格，移动端缩小显示 */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-4">
            <StatCard icon={Unlock} label={t('clan.ready')} value={counts.ready} color="green" compact />
            <StatCard icon={Lock} label={t('clan.locked')} value={counts.locked} color="red" compact />
            <StatCard icon={Ban} label={t('clan.other')} value={counts.other} color="gray" compact />
            <StatCard icon={Users} label={t('clan.blacklist')} value={counts.blacklist} color="amber" compact />
            <StatCard icon={Handshake} label={t('clan.ally')} value={counts.ally} color="pink" compact />
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textLight" strokeWidth={1.8} />
            <input
              type="text"
              placeholder={t('clan.search_placeholder')}
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
        <Card className="p-12 text-center">
          <p className="text-brand-textLight">{t('common.loading')}</p>
        </Card>
      ) : clans.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-muted/60 flex items-center justify-center">
            <Flag className="w-6 h-6 text-brand-textLight" strokeWidth={1.5} />
          </div>
          <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clans.map((clan) => (
              <Card key={clan.id} className="p-5 hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-brand-text truncate">{clan.name}</h4>
                    <p className="text-xs text-brand-textLight mt-0.5 font-mono">{clan.tag}</p>
                  </div>
                  {getStatusBadge(clan.status)}
                </div>
                <div className="space-y-1.5 text-xs text-brand-textLight mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{timeParse(clan.create_time)}</span>
                  </div>
                  <Badge type="default">
                    {clan.is_global ? t('clan.is_global') : t('clan.server_china')}
                  </Badge>
                </div>
                {isAdmin && (
                  <div className="flex justify-end">
                    <Link
                      to={`/clan-update/${clan.id}`}
                      className="flex items-center gap-1 text-xs text-brand-primary font-medium hover:underline"
                    >
                      <Edit className="w-3.5 h-3.5" strokeWidth={1.8} />
                      {t('common.edit')}
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {!search && hasMore && (
            <div ref={observerRef} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-brand-textLight text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.loading')}
                </div>
              )}
            </div>
          )}

          {!search && !hasMore && total > 0 && (
            <div className="py-6 text-center">
              <p className="text-xs text-brand-textLight/60">— {t('common.pagination.total')} {total} {t('common.pagination.items')} —</p>
            </div>
          )}
        </>
      )}
    </>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  compact = false,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  compact?: boolean;
}) => {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-500 border-red-100',
    gray: 'bg-gray-50 text-gray-500 border-gray-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    pink: 'bg-brand-soft/30 text-brand-primary border-brand-soft/60',
  };
  return (
    <div className={`rounded-xl border ${colorMap[color] || colorMap.pink} text-center shrink-0 ${compact ? 'min-w-[56px] px-2 py-1.5 sm:min-w-0 sm:px-2.5 sm:py-2' : 'p-3'}`}>
      <Icon className={`mx-auto ${compact ? 'w-4 h-4 mb-0.5 sm:w-5 sm:h-5 sm:mb-1' : 'w-5 h-5 mb-1'}`} strokeWidth={1.8} />
      <p className={`font-bold ${compact ? 'text-sm sm:text-lg' : 'text-lg'}`}>{value}</p>
      {label && <p className={`opacity-70 text-[10px] hidden sm:block`}>{label}</p>}
    </div>
  );
};

export default ClanPage;
