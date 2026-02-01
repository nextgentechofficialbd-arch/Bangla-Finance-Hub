import { getMonthlyReport, getSettings, updateSettings, getCurrentMonth } from './db';
import { format, lastDayOfMonth, isToday, subDays } from 'date-fns';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function showNotification(title: string, body: string, icon?: string): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const notification = new Notification(title, {
    body,
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'hisab-kitab-notification',
    requireInteraction: false,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

export async function checkAndShowMonthEndNotification(): Promise<void> {
  const settings = await getSettings();
  
  if (!settings.notificationsEnabled) return;

  const today = new Date();
  const lastDay = lastDayOfMonth(today);
  const twoDaysBefore = subDays(lastDay, 2);
  
  const shouldNotify = isToday(lastDay) || isToday(twoDaysBefore);
  if (!shouldNotify) return;

  const currentMonth = getCurrentMonth();
  const lastNotificationDate = settings.lastNotificationDate;
  
  if (lastNotificationDate === format(today, 'yyyy-MM-dd')) {
    return;
  }

  const report = await getMonthlyReport(currentMonth);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const title = settings.language === 'BN' 
    ? 'Hisab Kitab - Monthly Summary' 
    : 'Hisab Kitab - Monthly Summary';

  const body = settings.language === 'BN'
    ? `Income: ${formatCurrency(report.income)} | Expense: ${formatCurrency(report.expense)} | Balance: ${formatCurrency(report.balance)}`
    : `Income: ${formatCurrency(report.income)} | Expense: ${formatCurrency(report.expense)} | Balance: ${formatCurrency(report.balance)}`;

  await showNotification(title, body);
  
  await updateSettings({ lastNotificationDate: format(today, 'yyyy-MM-dd') });
}

export function setupNotificationCheck(): void {
  checkAndShowMonthEndNotification();
  
  setInterval(() => {
    checkAndShowMonthEndNotification();
  }, 1000 * 60 * 60 * 6);
}
