// Custom SWR hook for Customer Dashboard data
import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

interface CustomerJobsData {
    activeJobs: any[];
    leads: any[];
}

export function useCustomerJobs() {
    const { data, error, isLoading, mutate } = useSWR<CustomerJobsData>(
        '/api/customer/jobs',
        swrFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    return {
        activeJobs: data?.activeJobs || [],
        leads: data?.leads || [],
        isLoading,
        error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
        refresh: mutate,
    };
}
