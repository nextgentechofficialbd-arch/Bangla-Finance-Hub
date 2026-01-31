import { Link, useLocation } from "wouter";
import { LayoutDashboard, Wallet, PiggyBank, Users, Menu, PlusCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [location] = useLocation();
  const { t } = useI18n();

  const navItems = [
    { href: "/", label: t('dashboard'), icon: LayoutDashboard },
    { href: "/transactions", label: t('transactions'), icon: Wallet },
    // Middle is Action Button, handled separately
    { href: "/savings", label: t('savings'), icon: PiggyBank },
    { href: "/contacts", label: t('contacts'), icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-black via-black to-transparent pointer-events-none">
      <nav className="mx-auto max-w-md bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black p-2 pointer-events-auto">
        <div className="flex items-center justify-between relative">
          {/* Left Items */}
          <Link href="/" className={clsx("flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16", location === "/" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}>
            <LayoutDashboard size={20} strokeWidth={location === "/" ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">{t('dashboard')}</span>
          </Link>
          
          <Link href="/transactions" className={clsx("flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16", location === "/transactions" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}>
            <Wallet size={20} strokeWidth={location === "/transactions" ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">{t('transactions')}</span>
          </Link>

          {/* Center Action Button - Floating effect */}
          <div className="-mt-8 mx-1">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform">
                  <PlusCircle size={28} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="mb-2 w-48 bg-card border-white/10 text-card-foreground">
                <DropdownMenuItem className="focus:bg-primary/20 focus:text-primary cursor-pointer gap-2" onClick={() => window.location.href = '/transactions?action=add'}>
                  <Wallet size={16} /> {t('addTransaction')}
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-primary/20 focus:text-primary cursor-pointer gap-2" onClick={() => window.location.href = '/savings?action=add'}>
                  <PiggyBank size={16} /> {t('addSaving')}
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-primary/20 focus:text-primary cursor-pointer gap-2" onClick={() => window.location.href = '/contacts?action=add'}>
                  <Users size={16} /> {t('addContact')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Items */}
          <Link href="/savings" className={clsx("flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16", location === "/savings" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}>
            <PiggyBank size={20} strokeWidth={location === "/savings" ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">{t('savings')}</span>
          </Link>

          <Link href="/settings" className={clsx("flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16", location === "/settings" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}>
            <Menu size={20} strokeWidth={location === "/settings" ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">{t('settings')}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
