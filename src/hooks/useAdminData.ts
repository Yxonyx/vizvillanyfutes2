// Custom SWR hooks for Admin Dashboard data
import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

interface Job {
    id: string;
    title: string;
    description: string;
    trade: 'viz' | 'villany' | 'futes' | 'combined';
    category: 'sos' | 'standard' | 'b2b_project';
    status: string;
    priority: 'normal' | 'high' | 'critical';
    preferred_time_from?: string;
    preferred_time_to?: string;
    created_at: string;
    customer?: {
        full_name: string;
        phone: string;
    };
    address?: {
        city: string;
        district?: string;
        street: string;
        house_number: string;
    };
    assignments?: {
        id: string;
        status: string;
        contractor?: {
            id: string;
            display_name: string;
            phone: string;
        };
    }[];
}

interface Contractor {
    id: string;
    display_name: string;
    phone: string;
    type: 'individual' | 'company';
    trades: string[];
    service_areas: string[];
    years_experience?: number;
    status: 'pending_approval' | 'approved' | 'rejected' | 'suspended';
    created_at: string;
}

export function useAdminJobs(statusFilter: string) {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
    }

    const { data, error, isLoading, mutate } = useSWR<{ jobs: Job[] }>(
        `/api/admin/jobs?${params}`,
        swrFetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 3000,
        }
    );

    return {
        jobs: data?.jobs || [],
        isLoading,
        error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
        refresh: mutate,
        mutateJobs: mutate,
    };
}

export function useAdminContractors(statusFilter: string) {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
    }

    const { data, error, isLoading, mutate } = useSWR<{ contractors: Contractor[] }>(
        `/api/admin/contractors?${params}`,
        swrFetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 3000,
        }
    );

    return {
        contractors: data?.contractors || [],
        isLoading,
        error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
        refresh: mutate,
        mutateContractors: mutate,
    };
}

interface Lead {
    id: string;
    user_id: string;
    lat: number;
    lng: number;
    type: string;
    title: string;
    description: string;
    district: string;
    status: string;
    created_at: string;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    purchases?: {
        id: string;
        price_paid: number;
        purchased_at: string;
        contractor?: {
            id: string;
            display_name: string;
            phone: string;
        };
    }[];
}

export function useAdminLeads(statusFilter: string) {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
    }

    const { data, error, isLoading, mutate } = useSWR<{ leads: Lead[] }>(
        `/api/admin/leads?${params}`,
        swrFetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 3000,
        }
    );

    return {
        leads: data?.leads || [],
        isLoading,
        error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
        refresh: mutate,
        mutateLeads: mutate,
    };
}
