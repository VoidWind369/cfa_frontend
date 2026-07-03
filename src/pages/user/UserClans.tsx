import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Card, Badge } from '../../components/ui';
import { useUserStore } from '../../store/user';
import { userApi, clanApi } from '../../api';
import type { ClanInfo } from '../../types';

import {
  Search,
  ArrowLeft,
  Users,
  Check,
  Loader2,
  Menu,
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const UserClansPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isAdmin = useUserStore((s) => s.isAdmin());
  const { setSidebarOpen } = useSidebar();
  const [search, setSearch] = useState('');
  const [userClans, setUserClans] = useState<ClanInfo[]>([]);
  const [allClans, setAllClans] = useState<ClanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [clans, myClans] = await Promise.all([
        clanApi.list(),
        userApi.userClans(id),
      ]);
      setAllClans(clans || []);
      setUserClans(myClans || []);
    } catch (e) {
      console.error('Fetch error:', e);
      setAllClans([]);
      setUserClans([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (clanId: string, checked: boolean) => {
    if (!id) return;
    setUpdating(clanId);
    try {
      if (checked) {
        await userApi.bindClanUser(clanId, id);
      } else {
        await userApi.unbindClanUser(clanId, id);
      }
      await fetchData();
    } catch (e: unknown) {
      console.error('Clan bind error:', e);
      const message = e instanceof Error ? e.message : String(e);
      alert(message.includes('401') ? t('common.unauthorized') : message.includes('403') ? t('common.forbidden') : t('common.failed'));
    } finally {
      setUpdating(null);
    }
  };

  const isBound = (clanId: string) => userClans.some((c) => c.id && c.id === clanId);

  const filteredClans = search
    ? allClans.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.tag.toLowerCase().includes(search.toLowerCase())
      )
    : allClans;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
            >
              <Menu className="w-5 h-5 text-brand-text" />
            </button>
            <Link
              to="/user"
              className="inline-flex items-center gap-1.5 text-sm text-brand-textLight hover:text-brand-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
              {t('common.back')}
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-text mt-3 flex items-center gap-2"><Users className="w-5 h-5 text-brand-primary shrink-0" />{t('user.clan_bind')}</h1>
          <p className="text-brand-textLight text-sm mt-1">{t('user.clan_bind_subtitle')}</p>
        </header>

        <Card className="p-4">
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
        <Card className="p-8 text-center">
          <p className="text-brand-textLight">{t('common.loading')}</p>
        </Card>
      ) : filteredClans.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-muted/60 flex items-center justify-center">
            <Users className="w-6 h-6 text-brand-textLight" strokeWidth={1.5} />
          </div>
          <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClans.map((clan) => (
            <Card
              key={clan.id}
              className={`p-4 transition-all ${
                isBound(clan.id)
                  ? 'bg-gradient-to-br from-brand-soft/40 to-brand-muted/30 border-brand-primary/30'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                    transition-all cursor-pointer
                    ${
                      isBound(clan.id)
                        ? 'bg-brand-primary text-white'
                        : 'bg-brand-muted/60 text-brand-textLight hover:bg-brand-soft/60'
                    }
                  `}
                  onClick={() => handleToggle(clan.id, !isBound(clan.id))}
                >
                  {updating === clan.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                  ) : isBound(clan.id) ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-semibold text-brand-text truncate">{clan.name}</h4>
                    <Badge type={clan.status === 1 ? 'success' : 'default'}>
                      #{clan.tag}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-brand-textLight">
                    <span>{t('clan.status_' + (clan.status === 1 ? 'ready' : 'other'))}</span>
                    {clan.reward_point !== undefined && (
                      <span className={clan.reward_point > 0 ? 'text-green-500' : clan.reward_point < 0 ? 'text-red-500' : ''}>
                        {t('common.cfa_point')}: {clan.reward_point > 0 ? '+' : ''}{clan.reward_point}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default UserClansPage;
