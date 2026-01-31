import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard, Banknote, Landmark } from "lucide-react";
import { useMonthlyReport } from "@/hooks/use-finance";
import { useI18n } from "@/lib/i18n";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { t } = useI18n();
  const currentMonth = format(new Date(), "yyyy-MM");
  const { data: report, isLoading } = useMonthlyReport(currentMonth);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount);
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {t('dashboard')}
          </h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "MMMM yyyy")}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-emerald-300 p-[2px]">
           <div className="h-full w-full rounded-full bg-black flex items-center justify-center">
             <span className="font-bold text-primary">S</span>
           </div>
        </div>
      </div>

      {/* Main Balance */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-primary via-emerald-600 to-emerald-800 shadow-2xl shadow-emerald-900/50">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Banknote size={120} />
        </div>
        <div className="relative z-10">
          <p className="text-emerald-100 font-medium mb-1">{t('balance')}</p>
          <h2 className="text-4xl font-bold text-white mb-6">
            {formatCurrency(report?.balance || 0)}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
              <div className="bg-emerald-400/20 p-2 rounded-lg text-emerald-300">
                <ArrowUpCircle size={18} />
              </div>
              <div>
                <p className="text-xs text-emerald-100/70">{t('income')}</p>
                <p className="font-semibold text-white">{formatCurrency(report?.income || 0)}</p>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
              <div className="bg-red-400/20 p-2 rounded-lg text-red-300">
                <ArrowDownCircle size={18} />
              </div>
              <div>
                <p className="text-xs text-emerald-100/70">{t('expense')}</p>
                <p className="font-semibold text-white">{formatCurrency(report?.expense || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label={t('savings')} 
          value={formatCurrency(report?.savings || 0)} 
          icon={Wallet} 
          variant="secondary"
          delay={100}
        />
        <StatCard 
          label={t('receivable')} 
          value={formatCurrency(report?.receivable || 0)} 
          icon={CreditCard} 
          variant="primary"
          delay={200}
        />
        <StatCard 
          label={t('payable')} 
          value={formatCurrency(report?.payable || 0)} 
          icon={Landmark} 
          variant="danger"
          delay={300}
        />
      </div>

      {/* Recent Activity Placeholder (optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('recentTransactions')}</h3>
        <div className="bg-card/50 border border-white/5 rounded-2xl p-8 text-center">
          <p className="text-muted-foreground text-sm">{t('noData')}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32 bg-card" />
        <Skeleton className="h-10 w-10 rounded-full bg-card" />
      </div>
      <Skeleton className="h-56 w-full rounded-3xl bg-card" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-2xl bg-card" />
        <Skeleton className="h-32 rounded-2xl bg-card" />
        <Skeleton className="h-32 rounded-2xl bg-card" />
      </div>
    </div>
  );
}
