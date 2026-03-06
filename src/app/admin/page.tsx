'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Users, Clock, CheckCircle, AlertTriangle,
  LogOut, RefreshCw, Filter, Plus, Search, X,
  MapPin, Phone, Mail, Zap, Droplets, Flame, Wrench
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import JobCard from '@/components/JobCard';
import ContractorCard from '@/components/ContractorCard';
import { api, handleApiError } from '@/lib/api';
import { useAdminJobs, useAdminContractors, useAdminLeads } from '@/hooks/useAdminData';

// Simple notification component
function Notification({ message, type, onClose }: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-24 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-up min-w-[300px] max-w-md ${type === 'success'
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200'
      }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-red-500" />
      )}
      <p className="flex-1 text-gray-800 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}

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

function AdminContent() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'jobs' | 'contractors'>('jobs');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [contractorFilter, setContractorFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<Job | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // SWR-powered data fetching — always load leads alongside jobs for unified view
  const { jobs, isLoading: jobsLoading, refresh: refreshJobs, mutateJobs } = useAdminJobs(jobFilter === 'lead' ? 'all' : jobFilter);
  const { leads, isLoading: leadsLoading, refresh: refreshLeads } = useAdminLeads('all');
  const { contractors, isLoading: contractorsLoading, refresh: refreshContractors, mutateContractors } = useAdminContractors(contractorFilter);

  const isLoading = activeView === 'jobs' ? (jobsLoading || leadsLoading) : contractorsLoading;


  const handleApproveContractor = async (contractorId: string) => {
    if (!confirm('Biztosan jóváhagyod ezt a szakembert?')) return;
    setActionLoading(contractorId);
    try {
      const response = await api.post(`/api/admin/contractors/${contractorId}/approve`, {});
      if (response.success) {
        setNotification({ message: 'Szakember sikeresen jóváhagyva', type: 'success' });
        setContractorFilter('approved');
      } else {
        setNotification({ message: response.error || 'Hiba történt', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: handleApiError(err), type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectContractor = async (contractorId: string) => {
    const reason = prompt('Elutasítás oka (opcionális):');
    if (reason === null) return;
    setActionLoading(contractorId);
    try {
      const response = await api.post(`/api/admin/contractors/${contractorId}/reject`, { internal_notes: reason });
      if (response.success) {
        setNotification({ message: 'Szakember elutasítva', type: 'success' });
        refreshContractors();
      } else {
        setNotification({ message: response.error || 'Hiba történt', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: handleApiError(err), type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendContractor = async (contractorId: string) => {
    const reason = prompt('Felfüggesztés oka:');
    if (!reason) return;
    setActionLoading(contractorId);
    try {
      const response = await api.post(`/api/admin/contractors/${contractorId}/suspend`, { reason });
      if (response.success) {
        setNotification({ message: 'Szakember felfüggesztve', type: 'success' });
        setContractorFilter('suspended');
        refreshContractors();
      } else {
        setNotification({ message: response.error || 'Hiba történt', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: handleApiError(err), type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateContractor = async (contractorId: string) => {
    if (!confirm('Biztosan újraaktiválod ezt a szakembert?')) return;
    setActionLoading(contractorId);
    try {
      const response = await api.post(`/api/admin/contractors/${contractorId}/activate`, {});
      if (response.success) {
        setNotification({ message: 'Szakember újraaktiválva', type: 'success' });
        setContractorFilter('approved');
        refreshContractors();
      } else {
        setNotification({ message: response.error || 'Hiba történt', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: handleApiError(err), type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignJob = async (jobId: string, contractorId: string) => {
    setActionLoading(jobId);
    try {
      const response = await api.post('/api/admin/jobs/assign', { job_id: jobId, contractor_id: contractorId });
      if (response.success) {
        setShowAssignModal(null);
        setNotification({ message: `Munka sikeresen kiosztva`, type: 'success' });
        setJobFilter('assigned');
        refreshJobs();
      } else {
        setNotification({ message: response.error || 'Hiba történt', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: handleApiError(err), type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    const reason = prompt('Lemondás oka:');
    if (!reason) return;

    setActionLoading(jobId);
    try {
      const response = await api.put(`/api/admin/jobs/${jobId}`, {
        status: 'cancelled',
        cancellation_reason: reason,
      });
      if (response.success) {
        setNotification({ message: 'Munka sikeresen lemondva', type: 'success' });
        setJobFilter('cancelled');
        refreshJobs();
      } else {
        setNotification({ message: response.error || 'Hiba történt', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: handleApiError(err), type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Count stats
  const totalWorkCount = jobs.length + leads.filter(l => l.status === 'waiting').length;
  const waitingLeadsCount = leads.filter(l => l.status === 'waiting').length;
  const pendingContractorsCount = contractors.filter(c => c.status === 'pending_approval').length;

  const tradeIcons: Record<string, typeof Zap> = { villany: Zap, viz: Droplets, futes: Flame };
  const tradeLabelsMap: Record<string, string> = { villany: 'Villany', viz: 'Víz', futes: 'Fűtés' };
  const tradeColors: Record<string, string> = {
    villany: 'bg-amber-100 text-amber-700',
    viz: 'bg-blue-100 text-blue-700',
    futes: 'bg-red-100 text-red-700',
  };
  const leadStatusLabels: Record<string, string> = {
    waiting: 'Várakozik',
    converted: 'Átalakítva munkává',
    cancelled: 'Lemondva',
  };
  const leadStatusColors: Record<string, string> = {
    waiting: 'bg-amber-100 text-amber-700',
    converted: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 pb-12">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Admin Panel</h1>
            <p className="text-gray-600">
              {user?.role === 'admin' ? 'Adminisztrátor' : 'Diszpécser'} • {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { refreshJobs(); refreshLeads(); refreshContractors(); }}
              className="btn-outline py-2 px-4"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Frissítés</span>
            </button>
            <button
              onClick={() => logout()}
              className="btn-outline py-2 px-4 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Kijelentkezés</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveView('jobs')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${activeView === 'jobs'
              ? 'bg-vvm-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Munkák</span>
            {totalWorkCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeView === 'jobs' ? 'bg-white text-vvm-blue-600' : 'bg-vvm-blue-500 text-white'
                }`}>
                {totalWorkCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('contractors')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${activeView === 'contractors'
              ? 'bg-vvm-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            <Users className="w-5 h-5" />
            <span>Szakemberek</span>
            {pendingContractorsCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeView === 'contractors' ? 'bg-white text-vvm-blue-600' : 'bg-amber-500 text-white'
                }`}>
                {pendingContractorsCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Szűrés:</span>

            {activeView === 'jobs' && (
              <div className="flex flex-wrap gap-2 ml-2">
                {[
                  { value: 'all', label: 'Összes' },
                  { value: 'lead', label: '📍 Érdeklődés' },
                  { value: 'new', label: 'Új' },
                  { value: 'unassigned', label: '⚠️ Kiosztásra vár' },
                  { value: 'assigned', label: 'Kiosztva' },
                  { value: 'scheduled', label: 'Beütemezve' },
                  { value: 'in_progress', label: 'Folyamatban' },
                  { value: 'completed', label: 'Befejezve' },
                  { value: 'cancelled', label: 'Lemondva' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setJobFilter(opt.value)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${jobFilter === opt.value
                      ? 'bg-vvm-blue-100 text-vvm-blue-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {opt.label}
                    {opt.value === 'lead' && waitingLeadsCount > 0 && (
                      <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{waitingLeadsCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeView === 'contractors' && (
              <div className="flex flex-wrap gap-2 ml-2">
                {[
                  { value: 'all', label: 'Összes' },
                  { value: 'pending_approval', label: 'Jóváhagyásra vár' },
                  { value: 'approved', label: 'Jóváhagyott' },
                  { value: 'suspended', label: 'Felfüggesztett' },
                  { value: 'rejected', label: 'Elutasított' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setContractorFilter(opt.value)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${contractorFilter === opt.value
                      ? 'bg-vvm-blue-100 text-vvm-blue-700 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-vvm-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Betöltés...</p>
          </div>
        ) : activeView === 'jobs' ? (
          // Unified Work View (jobs + leads)
          (() => {
            // Determine which leads to show
            const showLeads = jobFilter === 'all' || jobFilter === 'lead';
            const showJobs = jobFilter !== 'lead';
            const visibleLeads = showLeads ? leads.filter(l => l.status === 'waiting') : [];
            const visibleJobs = showJobs ? jobs : [];
            const totalItems = visibleLeads.length + visibleJobs.length;

            if (totalItems === 0) {
              return (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nincs munka</h3>
                  <p className="text-gray-500">Ezzel a szűréssel nincs találat.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {/* Leads (érdeklődések) — shown first */}
                {visibleLeads.map((lead: any) => {
                  const TradeIcon = tradeIcons[lead.type] || Wrench;
                  return (
                    <div key={`lead-${lead.id}`} className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden">
                      <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Érdeklődés — nincs még jelentkező</span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tradeColors[lead.type] || 'bg-gray-100 text-gray-600'}`}>
                              <TradeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{lead.title}</h3>
                              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${tradeColors[lead.type] || 'bg-gray-100 text-gray-600'}`}>
                                {tradeLabelsMap[lead.type] || lead.type}
                              </span>
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${leadStatusColors[lead.status] || 'bg-gray-100 text-gray-500'}`}>
                            {leadStatusLabels[lead.status] || lead.status}
                          </span>
                        </div>
                        {lead.description && (
                          <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3 italic">&ldquo;{lead.description}&rdquo;</p>
                        )}
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          {lead.district && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>{lead.district}</span>
                            </div>
                          )}
                          {lead.contact_phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <a href={`tel:${lead.contact_phone}`} className="text-vvm-blue-600 hover:underline">{lead.contact_phone}</a>
                            </div>
                          )}
                          {lead.contact_email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <a href={`mailto:${lead.contact_email}`} className="text-vvm-blue-600 hover:underline truncate">{lead.contact_email}</a>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{new Date(lead.created_at).toLocaleString('hu-HU')}</span>
                          </div>
                        </div>
                        {lead.purchases && lead.purchases.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-500 mb-1">Érdeklődő szakember(ek):</p>
                            {lead.purchases.map((p: any) => (
                              <div key={p.id} className="flex items-center gap-2 text-sm text-gray-700">
                                <Users className="w-3.5 h-3.5 text-vvm-blue-500" />
                                <span className="font-medium">{p.contractor?.display_name || 'Ismeretlen'}</span>
                                {p.contractor?.phone && (
                                  <span className="text-gray-400">• {p.contractor.phone}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Jobs — shown after leads */}
                {visibleJobs.map((job) => (
                  <div key={job.id}>
                    <JobCard
                      job={job}
                      showActions={false}
                      showAssignedContractor={true}
                    />
                    {/* Admin actions bar - below card */}
                    <div className="mx-1 -mt-2 px-5 py-3 bg-gray-50 border border-t-0 border-gray-200 rounded-b-xl flex flex-wrap items-center gap-3">
                      {/* Status info */}
                      <div className="flex items-center gap-2 mr-auto">
                        <span className="text-xs text-gray-500">
                          Létrehozva: {new Date(job.created_at).toLocaleDateString('hu-HU')}
                        </span>
                      </div>

                      {/* Assign/Reassign button */}
                      {(() => {
                        const assignments = job.assignments || [];
                        const hasActiveAssignment = assignments.some(
                          (a: { status: string }) => a.status === 'pending' || a.status === 'accepted'
                        );
                        const hasDeclinedAssignments = assignments.some(
                          (a: { status: string }) => a.status === 'declined'
                        );
                        const needsAssignment = !hasActiveAssignment && job.status !== 'completed' && job.status !== 'cancelled';

                        return needsAssignment && (
                          <button
                            onClick={() => setShowAssignModal(job)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            {hasDeclinedAssignments ? 'Újrakiosztás' : 'Kiosztás'}
                          </button>
                        );
                      })()}

                      {/* Cancel button for active jobs */}
                      {job.status !== 'completed' && job.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelJob(job.id)}
                          disabled={actionLoading === job.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Lemondás
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        ) : (
          // Contractors View
          contractors.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nincs szakember</h3>
              <p className="text-gray-500">Ezzel a szűréssel nincs találat.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {contractors.map((contractor) => (
                <div key={contractor.id} className={actionLoading === contractor.id ? 'opacity-50 pointer-events-none' : ''}>
                  <ContractorCard
                    contractor={contractor}
                    onApprove={handleApproveContractor}
                    onReject={handleRejectContractor}
                    onSuspend={handleSuspendContractor}
                    onActivate={handleActivateContractor}
                    showActions={true}
                  />
                </div>
              ))}
            </div>
          )
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Munka kiosztása</h2>
                <p className="text-gray-600 text-sm mt-1">{showAssignModal.title}</p>
              </div>
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <p className="text-sm text-gray-500 mb-4">Válassz ki egy jóváhagyott szakembert:</p>
                <AssignContractorList
                  jobId={showAssignModal.id}
                  jobTrade={showAssignModal.trade}
                  onAssign={handleAssignJob}
                  isLoading={actionLoading === showAssignModal.id}
                />
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowAssignModal(null)}
                  className="btn-outline"
                >
                  Mégse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for contractor selection
function AssignContractorList({
  jobId,
  jobTrade,
  onAssign,
  isLoading
}: {
  jobId: string;
  jobTrade: string;
  onAssign: (jobId: string, contractorId: string) => void;
  isLoading: boolean;
}) {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedContractors = async () => {
      try {
        // Fetch ALL approved contractors - admin can assign any contractor
        const response = await api.get<{ contractors: Contractor[] }>('/api/admin/contractors?status=approved');
        if (response.success && response.data) {
          // Sort: matching trade first, then others
          const sorted = [...(response.data.contractors || [])].sort((a, b) => {
            const aMatches = a.trades?.includes(jobTrade) || a.trades?.includes('combined');
            const bMatches = b.trades?.includes(jobTrade) || b.trades?.includes('combined');
            if (aMatches && !bMatches) return -1;
            if (!aMatches && bMatches) return 1;
            return 0;
          });
          setContractors(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch contractors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedContractors();
  }, [jobTrade]);

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Betöltés...</div>;
  }

  if (contractors.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Nincs jóváhagyott szakember. Először hagyj jóvá szakembereket a Szakemberek fülön.
      </div>
    );
  }

  const tradeLabels: Record<string, string> = {
    viz: 'Víz',
    villany: 'Villany',
    futes: 'Fűtés',
    combined: 'Kombinált'
  };

  return (
    <div className="space-y-2">
      {contractors.map((contractor) => {
        const matchesTrade = contractor.trades?.includes(jobTrade) || contractor.trades?.includes('combined');
        return (
          <button
            key={contractor.id}
            onClick={() => onAssign(jobId, contractor.id)}
            disabled={isLoading}
            className={`w-full p-4 rounded-xl text-left transition-colors disabled:opacity-50 ${matchesTrade
              ? 'bg-green-50 hover:bg-green-100 border border-green-200'
              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-900">{contractor.display_name}</div>
              {matchesTrade && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Megfelelő szakma
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{contractor.phone}</div>
            <div className="text-xs text-gray-400 mt-1">
              {contractor.trades?.map(t => tradeLabels[t] || t).join(', ') || 'Nincs megadva'}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'dispatcher']}>
      <AdminContent />
    </ProtectedRoute>
  );
}
