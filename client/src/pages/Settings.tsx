import { useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { 
  Globe, 
  Moon, 
  ChevronRight, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  Info, 
  FileText, 
  HelpCircle, 
  Star, 
  Share2, 
  Lock,
  Wallet,
  Tag,
  Plus,
  Edit2,
  X,
  FileDown,
  CreditCard
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useExportData, useImportData, useClearData, usePaymentMethods, useCreatePaymentMethod, useDeletePaymentMethod, useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/use-finance";
import { generateMonthlyReportPDF, shareReport } from "@/lib/pdfReport";
import { getCurrentMonth } from "@/lib/db";
import { format, subMonths, addMonths } from "date-fns";
import clsx from "clsx";

export default function Settings() {
  const { t, language, setLanguage } = useI18n();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showPaymentMethodsDialog, setShowPaymentMethodsDialog] = useState(false);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reportMonth, setReportMonth] = useState(new Date());
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [newCategory, setNewCategory] = useState({ name: "", type: "EXPENSE" as const });
  
  const exportData = useExportData();
  const importData = useImportData();
  const clearData = useClearData();
  const { data: paymentMethods } = usePaymentMethods();
  const createPaymentMethod = useCreatePaymentMethod();
  const deletePaymentMethod = useDeletePaymentMethod();
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const toggleLanguage = () => {
    setLanguage(language === 'BN' ? 'EN' : 'BN');
    toast({
      title: language === 'BN' ? 'Language changed to English' : 'ভাষা বাংলায় পরিবর্তিত হয়েছে',
    });
  };

  const handleExportBackup = () => {
    exportData.mutate();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData.mutate(file);
    }
    e.target.value = '';
  };

  const handleExportPDF = async () => {
    const month = format(reportMonth, 'yyyy-MM');
    try {
      await generateMonthlyReportPDF(month, language);
      toast({ title: language === 'BN' ? 'PDF ডাউনলোড হয়েছে' : 'PDF downloaded' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    }
    setShowReportDialog(false);
  };

  const handleShareReport = async () => {
    const month = format(reportMonth, 'yyyy-MM');
    await shareReport(month, language);
    setShowReportDialog(false);
  };

  const handleClearData = () => {
    clearData.mutate(undefined, {
      onSuccess: () => {
        setShowClearDialog(false);
        window.location.reload();
      }
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: t('appName'),
      text: t('appTagline'),
      url: window.location.origin,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: language === 'BN' ? 'লিংক কপি হয়েছে' : 'Link copied!',
      });
    }
  };

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.trim()) {
      createPaymentMethod.mutate({
        name: newPaymentMethod.trim(),
        icon: 'CreditCard',
        isDefault: false,
      });
      setNewPaymentMethod("");
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      createCategory.mutate({
        name: newCategory.name.trim(),
        icon: 'Tag',
        color: '#6366F1',
        type: newCategory.type,
        isPrivate: false,
      });
      setNewCategory({ name: "", type: "EXPENSE" });
    }
  };

  const SettingsItem = ({ 
    icon: Icon, 
    iconBg, 
    iconColor, 
    title, 
    subtitle, 
    onClick, 
    rightElement,
    showArrow = true,
    testId
  }: { 
    icon: any; 
    iconBg: string; 
    iconColor: string; 
    title: string; 
    subtitle?: string; 
    onClick?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
    testId?: string;
  }) => (
    <div 
      className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
      onClick={onClick}
      data-testid={testId}
    >
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-full ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {rightElement ? rightElement : (showArrow && <ChevronRight size={18} className="text-muted-foreground" />)}
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-6 pb-2">{title}</h2>
  );

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <h1 className="text-2xl font-bold mb-2">{t('settings')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('appTagline')}</p>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportBackup} 
        accept=".json" 
        className="hidden" 
      />

      <SectionHeader title={t('general')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={Globe}
          iconBg="bg-purple-500/20"
          iconColor="text-purple-400"
          title={t('language')}
          subtitle={language === 'BN' ? 'বাংলা' : 'English'}
          onClick={toggleLanguage}
          rightElement={
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLanguage(); }}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors"
              data-testid="button-toggle-language"
            >
              {language === 'BN' ? 'EN' : 'বাং'}
            </button>
          }
          showArrow={false}
          testId="settings-language"
        />
        <SettingsItem
          icon={Moon}
          iconBg="bg-orange-500/20"
          iconColor="text-orange-400"
          title={t('darkMode')}
          subtitle={t('darkModeDesc')}
          rightElement={<Switch checked disabled />}
          showArrow={false}
          testId="settings-darkmode"
        />
      </div>

      <SectionHeader title={t('security')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={Lock}
          iconBg="bg-blue-500/20"
          iconColor="text-blue-400"
          title={t('pinLock')}
          subtitle={t('pinLockDesc')}
          rightElement={
            <Switch 
              checked={pinEnabled} 
              onCheckedChange={setPinEnabled}
              data-testid="switch-pin-lock"
            />
          }
          showArrow={false}
          testId="settings-pin-lock"
        />
      </div>

      <SectionHeader title={t('notifications')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={Bell}
          iconBg="bg-yellow-500/20"
          iconColor="text-yellow-400"
          title={t('notifications')}
          subtitle={t('notificationsDesc')}
          rightElement={
            <Switch 
              checked={notificationsEnabled} 
              onCheckedChange={setNotificationsEnabled}
              data-testid="switch-notifications"
            />
          }
          showArrow={false}
          testId="settings-notifications"
        />
      </div>

      <SectionHeader title={t('categories')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={CreditCard}
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          title={t('paymentMethod')}
          subtitle={`${paymentMethods?.length || 0} ${language === 'BN' ? 'টি মেথড' : 'methods'}`}
          onClick={() => setShowPaymentMethodsDialog(true)}
          testId="settings-payment-methods"
        />
        <SettingsItem
          icon={Tag}
          iconBg="bg-pink-500/20"
          iconColor="text-pink-400"
          title={t('categories')}
          subtitle={`${categories?.length || 0} ${language === 'BN' ? 'টি ক্যাটাগরি' : 'categories'}`}
          onClick={() => setShowCategoriesDialog(true)}
          testId="settings-categories"
        />
      </div>

      <SectionHeader title={t('dataBackup')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={FileDown}
          iconBg="bg-teal-500/20"
          iconColor="text-teal-400"
          title={language === 'BN' ? 'PDF রিপোর্ট' : 'PDF Report'}
          subtitle={language === 'BN' ? 'মাসিক রিপোর্ট ডাউনলোড করুন' : 'Download monthly report'}
          onClick={() => setShowReportDialog(true)}
          testId="settings-export-pdf"
        />
        <SettingsItem
          icon={Download}
          iconBg="bg-sky-500/20"
          iconColor="text-sky-400"
          title={language === 'BN' ? 'ব্যাকআপ ডাউনলোড' : 'Download Backup'}
          subtitle={language === 'BN' ? 'JSON ফাইল হিসাবে সংরক্ষণ করুন' : 'Save as JSON file'}
          onClick={handleExportBackup}
          testId="settings-export"
        />
        <SettingsItem
          icon={Upload}
          iconBg="bg-indigo-500/20"
          iconColor="text-indigo-400"
          title={language === 'BN' ? 'ব্যাকআপ রিস্টোর' : 'Restore Backup'}
          subtitle={language === 'BN' ? 'JSON ফাইল থেকে পুনরুদ্ধার করুন' : 'Restore from JSON file'}
          onClick={() => fileInputRef.current?.click()}
          testId="settings-import"
        />
        <SettingsItem
          icon={Trash2}
          iconBg="bg-red-500/20"
          iconColor="text-red-400"
          title={t('clearData')}
          subtitle={t('clearDataDesc')}
          onClick={() => setShowClearDialog(true)}
          testId="settings-clear-data"
        />
      </div>

      <SectionHeader title={t('about')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={Info}
          iconBg="bg-gray-500/20"
          iconColor="text-gray-400"
          title={t('aboutApp')}
          subtitle={`${t('version')} 1.0.0`}
          showArrow={false}
          testId="settings-about"
        />
        <SettingsItem
          icon={FileText}
          iconBg="bg-slate-500/20"
          iconColor="text-slate-400"
          title={t('privacyPolicy')}
          subtitle={language === 'BN' ? 'আপনার ডাটা শুধুমাত্র আপনার ডিভাইসে থাকে' : 'Your data stays only on your device'}
          showArrow={false}
          testId="settings-privacy"
        />
      </div>

      <SectionHeader title="" />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={Star}
          iconBg="bg-yellow-500/20"
          iconColor="text-yellow-400"
          title={t('rateApp')}
          onClick={() => toast({ title: language === 'BN' ? 'ধন্যবাদ!' : 'Thank you!' })}
          testId="settings-rate"
        />
        <SettingsItem
          icon={Share2}
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          title={t('shareApp')}
          subtitle={t('shareAppDesc')}
          onClick={handleShare}
          testId="settings-share"
        />
      </div>

      <div className="text-center pt-8 pb-4">
        <p className="text-lg font-semibold text-emerald-400">{t('appName')}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('version')} 1.0.0</p>
        <p className="text-xs text-muted-foreground mt-2">{t('madeWith')}</p>
        <p className="text-xs text-muted-foreground mt-1">&copy; 2024 {t('allRightsReserved')}</p>
      </div>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-red-400">{t('clearData')}</DialogTitle>
            <DialogDescription>{t('clearDataWarning')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowClearDialog(false)} data-testid="button-cancel-clear">
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleClearData} data-testid="button-confirm-clear">
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentMethodsDialog} onOpenChange={setShowPaymentMethodsDialog}>
        <DialogContent className="bg-card border-white/10 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('paymentMethod')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {paymentMethods?.map(pm => (
              <div key={pm.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span>{pm.name}</span>
                {!pm.isDefault && (
                  <button 
                    onClick={() => deletePaymentMethod.mutate(pm.id)}
                    className="text-red-400 hover:text-red-300"
                    data-testid={`delete-pm-${pm.id}`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Input 
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              placeholder={language === 'BN' ? 'নতুন মেথড' : 'New method'}
              className="bg-black/20 border-white/10"
              data-testid="input-new-payment-method"
            />
            <Button onClick={handleAddPaymentMethod} size="icon" data-testid="button-add-payment-method">
              <Plus size={18} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent className="bg-card border-white/10 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('categories')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {categories?.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <span>{cat.name}</span>
                  <span className={clsx(
                    "ml-2 text-xs px-2 py-0.5 rounded",
                    cat.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  )}>
                    {cat.type === 'INCOME' ? t('income') : t('expense')}
                  </span>
                </div>
                <button 
                  onClick={() => deleteCategory.mutate(cat.id)}
                  className="text-red-400 hover:text-red-300"
                  data-testid={`delete-cat-${cat.id}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Input 
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder={language === 'BN' ? 'নতুন ক্যাটাগরি' : 'New category'}
              className="bg-black/20 border-white/10 flex-1"
              data-testid="input-new-category"
            />
            <select 
              value={newCategory.type}
              onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'INCOME' | 'EXPENSE' })}
              className="bg-black/20 border border-white/10 rounded px-2 text-sm"
              data-testid="select-category-type"
            >
              <option value="EXPENSE">{t('expense')}</option>
              <option value="INCOME">{t('income')}</option>
            </select>
            <Button onClick={handleAddCategory} size="icon" data-testid="button-add-category">
              <Plus size={18} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>{language === 'BN' ? 'মাসিক রিপোর্ট' : 'Monthly Report'}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center gap-4 py-4">
            <button 
              onClick={() => setReportMonth(subMonths(reportMonth, 1))}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <span className="text-lg font-medium min-w-[150px] text-center">
              {format(reportMonth, 'MMMM yyyy')}
            </span>
            <button 
              onClick={() => setReportMonth(addMonths(reportMonth, 1))}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleShareReport} data-testid="button-share-report">
              <Share2 size={16} className="mr-2" />
              {language === 'BN' ? 'শেয়ার' : 'Share'}
            </Button>
            <Button onClick={handleExportPDF} className="bg-primary" data-testid="button-download-pdf">
              <Download size={16} className="mr-2" />
              {language === 'BN' ? 'PDF ডাউনলোড' : 'Download PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
