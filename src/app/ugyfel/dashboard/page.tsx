'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { AlertCircle, Clock, MapPin, Search, CheckCircle, Shield, ArrowRight, User, Droplets, Zap, Flame, Briefcase, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const DEFAULT_VIEWPORT = {
    latitude: 47.4979,
    longitude: 19.0402,
    zoom: 11
};

// Simple types for the dashboard
type JobAssignment = {
    status: string;
    contractor_profiles: {
        display_name: string;
        phone: string;
    };
};

type Address = {
    city: string;
    district: string;
    street: string;
};

type Job = {
    id: string;
    title: string;
    description: string;
    trade: string;
    status: string;
    created_at: string;
    latitude: number | null;
    longitude: number | null;
    addresses: Address;
    job_assignments: JobAssignment[];
};

export default function CustomerDashboard() {
    const { user, isCustomer, isLoading } = useAuth();
    const router = useRouter();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (!isLoading && !isCustomer) {
            router.push('/');
        }
    }, [user, isCustomer, isLoading, router]);

    useEffect(() => {
        async function fetchJobs() {
            if (!user) return;

            try {
                setLoadingJobs(true);
                const { data, error } = await supabase
                    .from('jobs')
                    .select(`
            id, title, description, trade, status, created_at, latitude, longitude,
            addresses ( city, district, street ),
            job_assignments (
              status,
              contractor_profiles ( display_name, phone )
            )
          `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // The cast is needed because the supabase nested select typings can be complex
                setJobs(data as unknown as Job[]);
            } catch (err) {
                console.error('Error fetching customer jobs:', err);
            } finally {
                setLoadingJobs(false);
            }
        }

        if (user && isCustomer) {
            fetchJobs();
        }
    }, [user, isCustomer]);

    const handleCancelJob = async (jobId: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt a bejelentést?')) return;
        setCancellingId(jobId);
        try {
            const res = await fetch(`/api/customer/jobs/${jobId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel' }),
            });
            const data = await res.json();
            if (data.success) {
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'cancelled_by_customer' } : j));
            } else {
                alert(data.error || 'Hiba történt a törlés során.');
            }
        } catch {
            alert('Hiba történt a törlés során.');
        } finally {
            setCancellingId(null);
        }
    };

    if (isLoading || !user || !isCustomer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-8 h-8 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const activeJobs = jobs.filter(j => !['completed', 'cancelled', 'cancelled_by_customer'].includes(j.status));
    const pastJobs = jobs.filter(j => ['completed', 'cancelled', 'cancelled_by_customer'].includes(j.status));

    const getStatusBadge = (status: string, assignments: JobAssignment[]) => {
        // If we have an accepted assignment, the pro is on their way or assigned
        const acceptedAssignment = assignments?.find(a => a.status === 'accepted');

        if (acceptedAssignment) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    Szakember úton
                </span>
            );
        }

        switch (status) {
            case 'new':
            case 'unassigned':
            case 'open':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 animate-pulse">
                        <Search className="w-4 h-4" />
                        Szakember keresése...
                    </span>
                );
            case 'unlocked':
            case 'assigned':
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Clock className="w-4 h-4" />
                        Egyeztetés alatt
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Befejezve
                    </span>
                );
            case 'cancelled':
            case 'cancelled_by_customer':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Törölve
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Folyamatban
                    </span>
                );
        }
    };

    const getTradeIcon = (trade: string) => {
        switch (trade) {
            case 'viz': return <Droplets className="w-5 h-5 text-sky-600" />;
            case 'villany': return <Zap className="w-5 h-5 text-amber-600" />;
            case 'futes': return <Flame className="w-5 h-5 text-orange-600" />;
            default: return <Briefcase className="w-5 h-5 text-purple-600" />;
        }
    };

    const getTradeColor = (trade: string) => {
        switch (trade) {
            case 'viz': return 'bg-sky-500';
            case 'villany': return 'bg-amber-500';
            case 'futes': return 'bg-orange-500';
            default: return 'bg-purple-500';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-heading">Ügyfél Portál</h1>
                        <p className="text-gray-600 mt-2">Kezelje bejelentéseit és kövesse nyomon a szakembereket.</p>
                    </div>
                    <Link href="/login?role=customer" className="btn-primary w-full md:w-auto justify-center">
                        Új probléma bejelentése
                    </Link>
                </div>

                {loadingJobs ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-8 h-8 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 mt-4">Bejelentések betöltése...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-vvm-blue-50 text-vvm-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Még nincsenek bejelentései</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Ha problémája akadna otthonában, itt tudja majd nyomon követni a kiérkező szakembert.
                        </p>
                        <Link href="/login?role=customer" className="btn-primary inline-flex">
                            Probléma bejelentése
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* Map Area */}
                        {activeJobs.filter(j => j.latitude && j.longitude).length > 0 && MAPBOX_TOKEN && (
                            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <h2 className="text-xl font-bold text-gray-900 p-5 pb-0 lg:hidden block">Térkép nézet</h2>
                                <div className="h-[300px] md:h-[400px] w-full relative">
                                    <Map
                                        initialViewState={{
                                            ...DEFAULT_VIEWPORT,
                                            latitude: activeJobs.find(j => j.latitude)?.latitude || DEFAULT_VIEWPORT.latitude,
                                            longitude: activeJobs.find(j => j.longitude)?.longitude || DEFAULT_VIEWPORT.longitude,
                                            zoom: 12
                                        }}
                                        mapStyle="mapbox://styles/mapbox/streets-v12"
                                        mapboxAccessToken={MAPBOX_TOKEN}
                                    >
                                        <NavigationControl position="bottom-right" />
                                        <GeolocateControl position="bottom-right" />

                                        {activeJobs.filter(j => j.latitude && j.longitude).map(job => (
                                            <Marker
                                                key={'map-job-' + job.id}
                                                latitude={job.latitude!}
                                                longitude={job.longitude!}
                                                anchor="bottom"
                                            >
                                                <div className="relative group cursor-pointer">
                                                    <div className={`relative w-10 h-10 rounded-full ${getTradeColor(job.trade)} shadow-lg shadow-black/20 flex items-center justify-center border-2 border-white z-10 hover:scale-110 transition-transform`}>
                                                        {getTradeIcon(job.trade)}
                                                    </div>

                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-white text-gray-800 text-sm px-3 py-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 border border-gray-100">
                                                        <p className="font-bold truncate">{job.title}</p>
                                                        <p className="text-xs text-gray-500 truncate">{job.addresses?.street}</p>
                                                    </div>
                                                </div>
                                            </Marker>
                                        ))}
                                    </Map>
                                </div>
                            </section>
                        )}

                        {/* Active Jobs */}
                        {activeJobs.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    Aktív ügyek
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {activeJobs.map(job => {
                                        const contractor = job.job_assignments?.find(a => a.status === 'accepted')?.contractor_profiles;

                                        return (
                                            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-vvm-blue-100 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-vvm-blue-50 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>

                                                <div className="flex justify-between items-start mb-4 relative z-10">
                                                    {getStatusBadge(job.status, job.job_assignments)}
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        {new Date(job.created_at).toLocaleDateString('hu-HU')}
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-lg text-gray-900 mb-2">{job.title}</h3>
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                    {job.description}
                                                </p>

                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span>{job.addresses?.city}, {job.addresses?.district}. kerület, {job.addresses?.street}</span>
                                                </div>

                                                {contractor ? (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                                                                {contractor.display_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{contractor.display_name}</p>
                                                                <p className="text-sm text-green-600 font-medium">{contractor.phone}</p>
                                                            </div>
                                                        </div>
                                                        <a href={`tel:${contractor.phone}`} className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                                                            <AlertCircle className="w-5 h-5" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 text-amber-700 bg-amber-50 p-3 rounded-lg">
                                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                                        <p className="text-xs font-medium">
                                                            Szakembereink a környéken értesítve lettek. Amint valaki elvállalja, itt fogja látni az elérhetőségét.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Cancel button for open/new jobs */}
                                                {(job.status === 'open' || job.status === 'new') && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                                        <button
                                                            onClick={() => handleCancelJob(job.id)}
                                                            disabled={cancellingId === job.id}
                                                            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            {cancellingId === job.id ? 'Törlés...' : 'Bejelentés törlése'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Past Jobs */}
                        {pastJobs.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 opacity-70">Korábbi ügyek</h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {pastJobs.map(job => (
                                        <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 opacity-75 hover:opacity-100 transition-opacity">
                                            <div className="flex justify-between items-start mb-3">
                                                {getStatusBadge(job.status, job.job_assignments)}
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {new Date(job.created_at).toLocaleDateString('hu-HU')}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 mb-1">{job.title}</h3>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="truncate">{job.addresses?.street}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
