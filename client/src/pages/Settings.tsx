import { useI18n } from "@/lib/i18n";
import { Globe, Shield, Moon, ChevronRight, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import clsx from "clsx";

export default function Settings() {
  const { t, language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'BN' ? 'EN' : 'BN');
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>

      <div className="space-y-4">
        {/* Language Card */}
        <div className="bg-card border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <p className="font-medium">{t('language')}</p>
              <p className="text-sm text-muted-foreground">{language === 'BN' ? 'বাংলা' : 'English'}</p>
            </div>
          </div>
          <button 
             onClick={toggleLanguage}
             className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
          >
            {language === 'BN' ? 'Change to English' : 'বাংলায় দেখুন'}
          </button>
        </div>

        {/* Security Section (Static) */}
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
             <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                 <Shield size={20} />
               </div>
               <span className="font-medium">Security & PIN</span>
             </div>
             <ChevronRight size={18} className="text-muted-foreground" />
          </div>
          
           <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
             <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                 <Moon size={20} />
               </div>
               <span className="font-medium">Dark Mode</span>
             </div>
             <Switch checked disabled />
          </div>
        </div>

        {/* Info */}
        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">Made with ❤️ for Bangladesh</p>
        </div>
      </div>
    </div>
  );
}
