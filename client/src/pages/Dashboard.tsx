import { useState } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { bn, enUS } from "date-fns/locale";
import { ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard, Banknote, Landmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useMonthlyReport, useTransactions } from "@/hooks/use-finance";
import { useI18n } from "@/lib/i18n";
import { StatCard } from "@/components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentMonth, getMonthKey } from "@/lib/db";
import clsx from "clsx";

export default function Dashboard() {
  const { t, language } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = getMonthKey(currentDate);
  const isCurrentMonth = currentMonth === getCurrentMonth();
  
  const { data: report, isLoading } = useMonthlyReport(currentMonth);
  const { data: recentTransactions } = useTransactions({ month: currentMonth });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'BN' ? 'bn-BD' : 'en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const locale = language === 'BN' ? bn : enUS;
  const monthDisplay = format(currentDate, "MMMM yyyy", { locale });

  if (isLoading) return <DashboardSkeleton />;

  const recent = recentTransactions?.slice(0, 5) || [];

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {t('dashboard')}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <button 
              onClick={goToPrevMonth}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              data-testid="button-prev-month"
            >
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
            <p className="text-sm text-muted-foreground min-w-[120px] text-center">{monthDisplay}</p>
            <button 
              onClick={goToNextMonth}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              data-testid="button-next-month"
            >
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-emerald-300 p-[2px]">
          <div className="h-full w-full rounded-full bg-black flex items-center justify-center">
            <span className="font-bold text-primary">H</span>
          </div>
        </div>
      </div>

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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('recentTransactions')}</h3>
        {recent.length === 0 ? (
          <div className="bg-card/50 border border-white/5 rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">{t('noData')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((tx, idx) => (
              <div 
                key={tx.id}
                className="bg-card/50 border border-white/5 p-3 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    tx.type === "INCOME" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  )}>
                    {tx.type === "INCOME" ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.note || tx.paymentMethod}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(tx.date), "dd MMM")}</p>
                  </div>
                </div>
                <span className={clsx(
                  "font-bold text-sm",
                  tx.type === "INCOME" ? "text-emerald-400" : "text-white"
                )}>
                  {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isCurrentMonth && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
          <p className="text-yellow-400 text-sm">
            {language === 'BN' ? 'আপনি আগের মাসের ডাটা দেখছেন (শুধুমাত্র দেখার জন্য)' : 'Viewing previous month data (read-only)'}
          </p>
        </div>
      )}
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
