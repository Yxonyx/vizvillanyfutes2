// Custom SWR hook for Contractor Marketplace data
import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

interface MarketplaceData {
    creditBalance: number;
    openJobs: any[];
    activeJobs: any[];
    completedJobs: any[];
    statistics: {
        available: number;
        active: number;
        completed: number;
    };
}

export function useMarketplace() {
    const { data, error, isLoading, mutate } = useSWR<MarketplaceData>(
        '/api/contractor/marketplace',
        swrFetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        }
    );

    return {
        openJobs: data?.openJobs || [],
        activeJobs: data?.activeJobs || [],
        completedJobs: data?.completedJobs || [],
        creditBalance: data?.creditBalance || 0,
        statistics: data?.statistics || { available: 0, active: 0, completed: 0 },
        isLoading,
        error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
        refresh: mutate,
    };
}
