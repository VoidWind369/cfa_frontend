import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui';
import { useSidebar } from '../../contexts/SidebarContext';
import {
  Info,
  ArrowLeft,
  Trophy,
  Scale,
  History,
  Zap,
  AlertTriangle,
  Lightbulb,
  Menu,
} from 'lucide-react';

const HomeInfoPage = () => {
  const { t } = useTranslation();
  const { setSidebarOpen } = useSidebar();

  return (
    <div className="min-h-full pb-8">
      {/* Sticky header area */}
      <div className="sticky top-0 z-10 backdrop-blur-md -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 sm:pb-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-brand-muted/60 transition-colors"
            >
              <Menu className="w-5 h-5 text-brand-text" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-glow flex items-center justify-center shadow-lg shadow-brand-primary/20">
                  <Info className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-brand-text">{t('dashboard.point_explanation')}</h1>
              </div>
              <p className="text-sm text-brand-textLight mt-1 ml-[52px] sm:ml-[46px]">{t('dashboard.explanation_subtitle')}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-textLight hover:text-brand-text hover:bg-brand-muted/60 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.back')}</span>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <SectionCard
          icon={<Trophy className="w-6 h-6 text-amber-500" />}
          title={t('explanation.step1')}
          description={t('explanation.step1_desc')}
          color="amber"
        />

        <SectionCard
          icon={<Scale className="w-6 h-6 text-brand-primary" />}
          title={t('explanation.step2')}
          description={t('explanation.step2_desc')}
          color="primary"
        />

        <SectionCard
          icon={<History className="w-6 h-6 text-emerald-500" />}
          title={t('explanation.step3')}
          description={t('explanation.step3_desc')}
          color="emerald"
        />

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-100/50 to-indigo-50/30 rounded-full blur-2xl" />
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-brand-text">{t('explanation.step4')}</h3>
            </div>
            <p className="text-sm text-brand-text leading-relaxed mb-4">
              {t('explanation.step4_intro')}
            </p>
            
            <div className="space-y-3 mb-4">
              <AccordionItem title={t('explanation.method1_title')} content={t('explanation.method1_desc')} />
              <AccordionItem title={t('explanation.method2_title')} content={t('explanation.method2_desc')} />
              <AccordionItem title={t('explanation.method3_title')} content={t('explanation.method3_desc')} defaultOpen>
                <ul className="list-disc list-inside text-sm text-brand-textLight mt-3 space-y-2">
                  <li>{t('explanation.method3_point1')}</li>
                  <li>{t('explanation.method3_point2')}</li>
                  <li>{t('explanation.method3_point3')}</li>
                  <li>{t('explanation.method3_point4')}</li>
                </ul>
              </AccordionItem>
              <AccordionItem title={t('explanation.method4_title')} content={t('explanation.method4_intro')}>
                <ul className="list-disc list-inside text-sm text-brand-textLight mt-3 space-y-2">
                  <li>{t('explanation.method4_point1')}</li>
                  <li>{t('explanation.method4_point2')}</li>
                  <li>{t('explanation.method4_point3')}</li>
                  <li>{t('explanation.method4_point4')}</li>
                  <li>{t('explanation.method4_point5')}</li>
                  <li>{t('explanation.method4_point6')}</li>
                </ul>
              </AccordionItem>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-100/50 to-orange-50/30 rounded-full blur-2xl" />
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-semibold text-brand-text">{t('explanation.step5')}</h3>
            </div>
            <p className="text-sm text-brand-text leading-relaxed mb-4">
              {t('explanation.step5_desc')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-brand-muted/60 border border-brand-border/50">
                <p className="text-xs font-medium text-brand-textLight mb-1">{t('explanation.control1_title')}</p>
                <p className="text-sm text-brand-text">{t('explanation.control1_desc')}</p>
              </div>
              <div className="p-4 rounded-xl bg-brand-muted/60 border border-brand-border/50">
                <p className="text-xs font-medium text-brand-textLight mb-1">{t('explanation.control2_title')}</p>
                <p className="text-sm text-brand-text">{t('explanation.control2_desc')}</p>
              </div>
            </div>
            
            <p className="text-sm text-brand-text">
              {t('explanation.control3_desc')}
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-brand-error">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-50/30 rounded-full blur-2xl" />
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-brand-text">{t('explanation.step6')}</h3>
            </div>
            <p className="text-sm text-brand-text leading-relaxed">
              {t('explanation.step6_desc')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SectionCard = ({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) => {
  const colorClasses = {
    amber: 'from-amber-50 to-orange-50 border-amber-100/50',
    primary: 'from-brand-soft/50 to-pink-50 border-brand-soft/50',
    emerald: 'from-emerald-50 to-green-50 border-emerald-100/50',
  };

  return (
    <Card className={`relative overflow-hidden border ${colorClasses[color as keyof typeof colorClasses]} bg-gradient-to-br animate-slide-up`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-brand-text mb-2">{title}</h3>
            <p className="text-sm text-brand-text leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const AccordionItem = ({
  title,
  content,
  children,
  defaultOpen = false,
}: {
  title: string;
  content: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-brand-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-muted/30 transition-colors"
      >
        <span className="text-sm font-medium text-brand-text">{title}</span>
        <div className={`w-5 h-5 rounded-full bg-brand-muted flex items-center justify-center transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-textLight">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-sm text-brand-text leading-relaxed">
          <p>{content}</p>
          {children}
        </div>
      )}
    </div>
  );
};

export default HomeInfoPage;