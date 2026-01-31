import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { 
  Globe, 
  Shield, 
  Moon, 
  ChevronRight, 
  Bell, 
  Download, 
  Cloud, 
  Trash2, 
  Info, 
  FileText, 
  HelpCircle, 
  Star, 
  Share2, 
  Lock,
  Fingerprint,
  Wallet,
  Tag,
  Clock,
  Mail,
  MessageCircle,
  ExternalLink
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
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { t, language, setLanguage } = useI18n();
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleLanguage = () => {
    setLanguage(language === 'BN' ? 'EN' : 'BN');
    toast({
      title: language === 'BN' ? 'Language changed to English' : 'ভাষা বাংলায় পরিবর্তিত হয়েছে',
    });
  };

  const handleExport = () => {
    toast({
      title: t('comingSoon'),
      description: 'PDF export feature will be available soon.',
    });
  };

  const handleBackup = () => {
    toast({
      title: t('comingSoon'),
      description: 'Cloud backup feature will be available soon.',
    });
  };

  const handleClearData = () => {
    localStorage.clear();
    setShowClearDialog(false);
    window.location.reload();
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
        title: 'Link copied!',
        description: 'Share link copied to clipboard.',
      });
    }
  };

  const handleRate = () => {
    toast({
      title: t('comingSoon'),
      description: 'App store rating will be available soon.',
    });
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

      {/* General Settings */}
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
          icon={Wallet}
          iconBg="bg-green-500/20"
          iconColor="text-green-400"
          title={t('currency')}
          subtitle={t('currencyBDT')}
          testId="settings-currency"
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

      {/* Security */}
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
        <SettingsItem
          icon={Fingerprint}
          iconBg="bg-cyan-500/20"
          iconColor="text-cyan-400"
          title={t('biometric')}
          subtitle={t('biometricDesc')}
          rightElement={<span className="text-xs text-muted-foreground">{t('comingSoon')}</span>}
          showArrow={false}
          testId="settings-biometric"
        />
      </div>

      {/* Notifications & Reminders */}
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
        <SettingsItem
          icon={Clock}
          iconBg="bg-indigo-500/20"
          iconColor="text-indigo-400"
          title={t('reminder')}
          subtitle={t('reminderDesc')}
          testId="settings-reminder"
        />
      </div>

      {/* Budget & Categories */}
      <SectionHeader title={t('categories')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={Wallet}
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          title={t('monthlyBudget')}
          subtitle={t('monthlyBudgetDesc')}
          testId="settings-budget"
        />
        <SettingsItem
          icon={Tag}
          iconBg="bg-pink-500/20"
          iconColor="text-pink-400"
          title={t('categories')}
          subtitle={t('categoriesDesc')}
          testId="settings-categories"
        />
      </div>

      {/* Data & Backup */}
      <SectionHeader title={t('dataBackup')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={Download}
          iconBg="bg-teal-500/20"
          iconColor="text-teal-400"
          title={t('exportData')}
          subtitle={t('exportDataDesc')}
          onClick={handleExport}
          testId="settings-export"
        />
        <SettingsItem
          icon={Cloud}
          iconBg="bg-sky-500/20"
          iconColor="text-sky-400"
          title={t('backupRestore')}
          subtitle={t('backupRestoreDesc')}
          onClick={handleBackup}
          testId="settings-backup"
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

      {/* Help & Support */}
      <SectionHeader title={t('helpSupport')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={HelpCircle}
          iconBg="bg-violet-500/20"
          iconColor="text-violet-400"
          title={t('faq')}
          testId="settings-faq"
        />
        <SettingsItem
          icon={Mail}
          iconBg="bg-rose-500/20"
          iconColor="text-rose-400"
          title={t('contactUs')}
          testId="settings-contact"
        />
        <SettingsItem
          icon={MessageCircle}
          iconBg="bg-amber-500/20"
          iconColor="text-amber-400"
          title={t('helpSupport')}
          testId="settings-help"
        />
      </div>

      {/* About & Legal */}
      <SectionHeader title={t('about')} />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={Info}
          iconBg="bg-gray-500/20"
          iconColor="text-gray-400"
          title={t('aboutApp')}
          subtitle={`${t('version')} 1.0.0`}
          testId="settings-about"
        />
        <SettingsItem
          icon={FileText}
          iconBg="bg-slate-500/20"
          iconColor="text-slate-400"
          title={t('privacyPolicy')}
          rightElement={<ExternalLink size={16} className="text-muted-foreground" />}
          showArrow={false}
          testId="settings-privacy"
        />
        <SettingsItem
          icon={FileText}
          iconBg="bg-zinc-500/20"
          iconColor="text-zinc-400"
          title={t('termsOfService')}
          rightElement={<ExternalLink size={16} className="text-muted-foreground" />}
          showArrow={false}
          testId="settings-terms"
        />
      </div>

      {/* Share & Rate */}
      <SectionHeader title="" />
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        <SettingsItem
          icon={Star}
          iconBg="bg-yellow-500/20"
          iconColor="text-yellow-400"
          title={t('rateApp')}
          onClick={handleRate}
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

      {/* Footer */}
      <div className="text-center pt-8 pb-4">
        <p className="text-lg font-semibold text-emerald-400">{t('appName')}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('version')} 1.0.0</p>
        <p className="text-xs text-muted-foreground mt-2">{t('madeWith')}</p>
        <p className="text-xs text-muted-foreground mt-1">&copy; 2024 {t('allRightsReserved')}</p>
      </div>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-red-400">{t('clearData')}</DialogTitle>
            <DialogDescription>
              {t('clearDataWarning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowClearDialog(false)}
              data-testid="button-cancel-clear"
            >
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearData}
              data-testid="button-confirm-clear"
            >
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
