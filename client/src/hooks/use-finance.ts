import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import * as db from "@/lib/db";
import type { Transaction, Saving, Contact, Category, PaymentMethod, MonthlyReport } from "@/lib/db";

export function useTransactions(filters?: { month?: string; type?: string }) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => db.getTransactions(filters),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Omit<Transaction, 'id' | 'month'>) => db.addTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      toast({ title: "Success", description: "Transaction added successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => db.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      toast({ title: "Deleted", description: "Transaction removed" });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) => 
      db.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
  });
}

export function useSavings(month?: string) {
  return useQuery({
    queryKey: ['savings', month],
    queryFn: () => db.getSavings(month),
  });
}

export function useCreateSaving() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Omit<Saving, 'id' | 'month'>) => db.addSaving(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      toast({ title: "Success", description: "Saving record added" });
    },
  });
}

export function useDeleteSaving() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => db.deleteSaving(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      toast({ title: "Deleted", description: "Saving record removed" });
    },
  });
}

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => db.getContacts(),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Omit<Contact, 'id'>) => db.addContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      toast({ title: "Success", description: "Contact added" });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Contact> }) => 
      db.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => db.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      toast({ title: "Deleted", description: "Contact removed" });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => db.getCategories(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Category, 'id'>) => db.addCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) => 
      db.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => db.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => db.getPaymentMethods(),
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Omit<PaymentMethod, 'id'>) => db.addPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({ title: "Success", description: "Payment method added" });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PaymentMethod> }) => 
      db.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => db.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({ title: "Deleted", description: "Payment method removed" });
    },
  });
}

export function useMonthlyReport(month: string) {
  return useQuery({
    queryKey: ['report', month],
    queryFn: () => db.getMonthlyReport(month),
  });
}

export function useAllMonths() {
  return useQuery({
    queryKey: ['months'],
    queryFn: () => db.getAllMonths(),
  });
}

export function useExportData() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const data = await db.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hisab-kitab-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Data exported successfully" });
    },
  });
}

export function useImportData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      await db.importData(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: "Success", description: "Data imported successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useClearData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: () => db.clearAllData(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: "Success", description: "All data cleared" });
    },
  });
}

export { db };
