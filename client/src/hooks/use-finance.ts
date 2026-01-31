import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertTransaction, type InsertSaving, type InsertContact, type InsertCategory } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// TRANSACTIONS
export function useTransactions(filters?: { month?: string; type?: string; categoryId?: string; paymentMethod?: string; search?: string }) {
  // Convert filters to string params for URL if necessary or pass as query params if handled by fetch
  // Since our api definition handles query params via z.object in input, we need to construct URL manually or pass params
  const queryKey = [api.transactions.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string
      const params = new URLSearchParams();
      if (filters?.month) params.append("month", filters.month);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.categoryId) params.append("categoryId", filters.categoryId);
      if (filters?.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
      if (filters?.search) params.append("search", filters.search);

      const res = await fetch(`${api.transactions.list.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const res = await fetch(api.transactions.create.path, {
        method: api.transactions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.monthly.path] });
      toast({ title: "Success", description: "Transaction added successfully" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.transactions.delete.path, { id });
      const res = await fetch(url, { method: api.transactions.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete transaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.monthly.path] });
      toast({ title: "Deleted", description: "Transaction removed" });
    },
  });
}

// SAVINGS
export function useSavings() {
  return useQuery({
    queryKey: [api.savings.list.path],
    queryFn: async () => {
      const res = await fetch(api.savings.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch savings");
      return api.savings.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSaving() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertSaving) => {
      const res = await fetch(api.savings.create.path, {
        method: api.savings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add saving");
      return api.savings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.savings.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.monthly.path] });
      toast({ title: "Success", description: "Saving record added" });
    },
  });
}

export function useDeleteSaving() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.savings.delete.path, { id });
      const res = await fetch(url, { method: api.savings.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete saving");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.savings.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.monthly.path] });
      toast({ title: "Deleted", description: "Saving record removed" });
    },
  });
}

// CONTACTS (Dena-Pona)
export function useContacts() {
  return useQuery({
    queryKey: [api.contacts.list.path],
    queryFn: async () => {
      const res = await fetch(api.contacts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return api.contacts.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertContact) => {
      const res = await fetch(api.contacts.create.path, {
        method: api.contacts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add contact");
      return api.contacts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.contacts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.monthly.path] });
      toast({ title: "Success", description: "Contact added" });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.contacts.delete.path, { id });
      const res = await fetch(url, { method: api.contacts.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete contact");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.contacts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.monthly.path] });
      toast({ title: "Deleted", description: "Contact removed" });
    },
  });
}

// CATEGORIES
export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return api.categories.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCategory) => {
      const res = await fetch(api.categories.create.path, {
        method: api.categories.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create category");
      return api.categories.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
    },
  });
}

// REPORTS
export function useMonthlyReport(month: string) {
  return useQuery({
    queryKey: [api.reports.monthly.path, month],
    queryFn: async () => {
      const params = new URLSearchParams({ month });
      const res = await fetch(`${api.reports.monthly.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch report");
      return api.reports.monthly.responses[200].parse(await res.json());
    },
  });
}
