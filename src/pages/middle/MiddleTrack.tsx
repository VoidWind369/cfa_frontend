import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Badge } from '../../components/ui';
import { middleApi } from '../../api';
import { ExternalLink, Clock, Trophy, Menu } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

const MiddleTrackPage = () => {
  const { t } = useTranslation();
  const { tag = '' } = useParams();
  const navigate = useNavigate();
  const { setSidebarOpen } = useSidebar();
  const [inputTag, setInputTag] = useState(tag ? tag.replace('#', '').toUpperCase() : '');
  const [searchTag, setSearchTag] = useState(tag ? tag.replace('#', '').toUpperCase() : '');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    const cleanTag = inputTag.replace('#', '').toUpperCase().trim();
    if (cleanTag) {
      setSearchTag(cleanTag);
      navigate(`/middle-track/${cleanTag}`, { replace: true });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (!searchTag) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await middleApi.track(searchTag);
        setData(res);
      } catch (e) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTag]);

  return (
    <>
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <header className="flex items-start gap-3 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
          >
            <Menu className="w-5 h-5 text-brand-text" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text flex items-center gap-2"><ExternalLink className="w-5 h-5 text-brand-primary shrink-0" />{t('track.public_track')}</h1>
            <p className="text-brand-textLight text-sm mt-1">{t('track.search_tag_placeholder')}</p>
          </div>
        </header>

        <Card className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value.replace('#', '').toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder={t('track.search_tag_placeholder')}
                className="w-full pl-10 pr-4 py-3 bg-brand-muted/50 border border-transparent rounded-xl text-sm
                  text-brand-text placeholder:text-brand-textLight focus:outline-none focus:border-brand-border
                  focus:bg-white transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-textLight font-medium">#</span>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-brand-primary text-white rounded-xl text-sm font-medium
                hover:bg-brand-primaryHover active:scale-[0.98] transition-all"
            >
              {t('common.search')}
            </button>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <a
              href="https://www.cocbzlm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-textLight hover:text-brand-text transition-colors"
            >
              BZLM
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Card>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-brand-textLight text-sm">{t('common.loading')}</p>
        </Card>
      ) : !data ? (
        <Card className="p-8 text-center">
          <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
        </Card>
      ) : (
        <>
          <Card className="p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-brand-text mb-4">#{data.tag || searchTag}</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-brand-soft/30 rounded-xl p-4">
                <p className="text-xs text-purple-500 font-medium mb-1">{t('track.bz_point')}</p>
                <p className="text-2xl font-bold text-purple-600">{data.bz_total_score ?? 0}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-brand-soft/30 rounded-xl p-4">
                <p className="text-xs text-blue-500 font-medium mb-1">{t('track.public_point')}</p>
                <p className="text-2xl font-bold text-blue-600">{data.public_total_score ?? 0}</p>
              </div>
            </div>
            {data.summary && data.summary.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {data.summary.map((item: string, i: number) => (
                  <Badge key={i} type="default">{item}</Badge>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-brand-border bg-brand-muted/20">
              <h3 className="font-semibold text-brand-text">{t('track.track_details')}</h3>
            </div>
            {!data.details || data.details.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-brand-textLight text-sm">{t('common.no_data')}</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-border">
                {data.details.map((detail: any, i: number) => (
                  <div key={i} className="p-4 hover:bg-brand-muted/10 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge type="default">{detail.clan_tag || t('common.unknown')}</Badge>
                      {detail.opp_clan_tag ? (
                        <Badge type="default">vs {detail.opp_clan_tag}</Badge>
                      ) : (
                        <Badge type="warning">{t('common.unknown')}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-textLight" strokeWidth={1.5} />
                        <div>
                          <span className="text-brand-textLight text-xs">{t('track.bz_round')}:</span>
                          <p className="font-medium text-brand-text">{detail.bz_round}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-brand-textLight" strokeWidth={1.5} />
                        <div>
                          <span className="text-brand-textLight text-xs">{t('track.round_result')}:</span>
                          <p className="font-medium text-brand-text">{detail.round_result || t('common.unknown')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${detail.round_point >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                          <span className="text-xs font-bold">{detail.round_point >= 0 ? '+' : ''}{detail.round_point}</span>
                        </div>
                        <div>
                          <span className="text-brand-textLight text-xs">{t('track.round_point')}:</span>
                          <p className={`font-medium ${detail.round_point >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {detail.round_point >= 0 ? '+' : ''}{detail.round_point}
                          </p>
                        </div>
                      </div>
                    </div>
                    {detail.explain && (
                      <div className="mt-2 text-xs text-brand-textLight/60">
                        {detail.explain}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
};

export default MiddleTrackPage;
