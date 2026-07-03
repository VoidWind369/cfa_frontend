import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { Card, Badge, Button, ConfirmModal } from '../../components/ui';
import { useUserStore } from '../../store/user';
import { userApi } from '../../api';
import type { UserInfo } from '../../types';
import { timeParse } from '../../api/request';
import {
  Search,
  Plus,
  Users,
  Mail,
  Clock,
  User,
  Trash2,
  Loader2,
  Menu,
  Edit,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const PAGE_SIZE = 20;

const UserPage = () => {
  const { t } = useTranslation();
  const isAdmin = useUserStore((s) => s.isAdmin());
  const { setSidebarOpen } = useSidebar();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserInfo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async (pageNum: number) => {
    if (isLoadingRef.current || search || !hasMore) return;

    isLoadingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await userApi.listPage(pageNum, PAGE_SIZE);
      const data = res.data || [];
      // 基于唯一 id 去重
      setUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        const newData = data.filter((u) => !existingIds.has(u.id));
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
      setPage(1);
      setHasMore(true);
      try {
        if (search) {
          const data = await userApi.search(search);
          setUsers(Array.isArray(data) ? data : []);
          setTotal(Array.isArray(data) ? data.length : 0);
          setHasMore(false);
        } else {
          const res = await userApi.listPage(1, PAGE_SIZE);
          const data = res.data || [];
          setUsers(data);
          setTotal(res.data_count || 0);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch (e) {
        setUsers([]);
        setTotal(0);
        setHasMore(false);
      } finally {
        setLoading(false);
        initializedRef.current = true;
      }
    };

    const timer = setTimeout(fetchInitial, search ? 300 : 0);
    return () => clearTimeout(timer);
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

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setDeleting(true);
    try {
      await userApi.delete(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1: return <Badge type="success">{t('user.status_active')}</Badge>;
      case 0: return <Badge type="error">{t('user.status_inactive')}</Badge>;
      default: return <Badge type="warning">{t('user.status_pending')}</Badge>;
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
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2"><Users className="w-5 h-5 text-brand-primary shrink-0" />{t('user.title')}</h1>
              <p className="text-brand-textLight text-sm mt-1">
                {t('user.subtitle')}
                {!search && total > 0 && (
                  <span className="ml-2">
                    ({t('common.pagination.total')} {total} {t('common.pagination.items')})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Link to="/user-add">
              <Button className="gap-1.5">
                <Plus className="w-4 h-4" strokeWidth={2} />
                {t('user.add_user')}
              </Button>
            </Link>
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
      ) : users.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-muted/60 flex items-center justify-center">
            <Users className="w-6 h-6 text-brand-textLight" strokeWidth={1.5} />
          </div>
          <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="divide-y divide-brand-border">
              {users.map((user) => (
                <div key={user.id} className="p-5 hover:bg-brand-muted/20 transition-colors">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-stone-500" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/user-clans/${user.id}`}
                          className="font-semibold text-brand-text truncate hover:text-brand-primary transition-colors"
                        >
                          {user.name}
                        </Link>
                        {isAdmin && (
                          <div className="flex items-center gap-1 ml-auto shrink-0">
                            <Link
                              to={`/user-update/${user.id}`}
                              className="p-1 rounded-lg text-brand-textLight hover:text-brand-primary hover:bg-brand-soft/50 transition-colors"
                              title={t('common.edit')}
                            >
                              <Edit className="w-3.5 h-3.5" strokeWidth={1.8} />
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="p-1 rounded-lg text-brand-textLight hover:text-red-500 hover:bg-red-50 transition-colors"
                              title={t('common.delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-brand-textLight font-mono">{user.code}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ml-12">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(user.status ?? 0)}
                      <div className="flex items-center gap-1.5 text-xs text-brand-textLight">
                        <Mail className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-brand-textLight">
                      <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                      {timeParse(user.create_time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

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

      <ConfirmModal
        open={!!deleteTarget}
        title={t('common.delete')}
        message={deleteTarget ? t('user.confirm_delete') + ' (' + deleteTarget.name + ')' : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleting(false); }}
      />
    </>
  );
};

export default UserPage;
