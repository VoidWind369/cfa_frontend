import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, Badge } from '../../components/ui';
import { useSidebar } from '../../contexts/SidebarContext';
import { middleApi } from '../../api';
import type { MiddleReadCompoInfo } from '../../types';
import { timeParse } from '../../api/request';
import {
  Castle,
  Target,
  Clock,
  Shield,
  Menu,
  ArrowLeft,
} from 'lucide-react';

const ReadCompoPage = () => {
  const { t } = useTranslation();
  const { setSidebarOpen } = useSidebar();
  const [data, setData] = useState<MiddleReadCompoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await middleApi.readCompo();
        setData(res.data || null);
      } catch (e) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
            >
              <Menu className="w-5 h-5 text-brand-text" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary shrink-0" />
                <span className="truncate">{t('middle.read_compo')}</span>
              </h1>
              <p className="text-brand-textLight text-xs sm:text-sm mt-0.5 truncate">{t('middle.read_compo_desc')}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-textLight hover:text-brand-text hover:bg-brand-muted/60 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Link>
        </header>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-brand-textLight">{t('common.loading')}</p>
        </Card>
      ) : !data ? (
        <Card className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-muted/60 flex items-center justify-center">
            <Target className="w-6 h-6 text-brand-textLight" strokeWidth={1.5} />
          </div>
          <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Castle className="w-5 h-5 text-brand-primary" />
                <h2 className="text-lg font-semibold text-brand-text">{t('middle.avg_town_lv')}</h2>
              </div>
              
              <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-br from-indigo-50 to-brand-soft/30 rounded-2xl">
                <div className="text-center">
                  <p className="text-xs text-indigo-500 font-medium mb-1">{t('middle.min_avg')}</p>
                  <p className="text-3xl font-bold text-indigo-600">{data.min_th_avg.toFixed(1)}</p>
                </div>
                <div className="w-px h-12 bg-indigo-200" />
                <div className="text-center">
                  <p className="text-xs text-rose-500 font-medium mb-1">{t('middle.max_avg')}</p>
                  <p className="text-3xl font-bold text-rose-500">{data.max_th_avg.toFixed(1)}</p>
                </div>
              </div>

              {data.global && (
                <Badge type="default" className="w-fit">
                  <Shield className="w-3 h-3 mr-1" />
                  {t('middle.global')}
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-brand-primary" />
                <h2 className="text-lg font-semibold text-brand-text">{t('middle.reference')}</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.calculated_composition.map((compo, index) => (
                  <Badge
                    key={index}
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-stone-600 to-neutral-600 text-white border-0"
                  >
                    {compo}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-brand-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-textLight">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{t('middle.calculated_at')}</span>
              </div>
              <span className="text-sm font-medium text-brand-text">
                {timeParse(data.calculated_time)}
              </span>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ReadCompoPage;
