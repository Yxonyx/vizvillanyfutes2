'use client';

import { 
  User, Phone, MapPin, Briefcase, CheckCircle, XCircle, Clock,
  Droplets, Zap, Flame, Ban, Play
} from 'lucide-react';

const tradeIcons: Record<string, typeof Droplets> = {
  viz: Droplets,
  villany: Zap,
  futes: Flame,
};

const tradeLabels: Record<string, string> = {
  viz: 'Víz',
  villany: 'Villany',
  futes: 'Fűtés',
  combined: 'Kombinált',
};

const statusConfig: Record<string, { color: string; label: string; icon: typeof Clock }> = {
  pending_approval: { color: 'amber', label: 'Jóváhagyásra vár', icon: Clock },
  approved: { color: 'green', label: 'Aktív szakember', icon: CheckCircle },
  rejected: { color: 'red', label: 'Elutasítva', icon: XCircle },
  suspended: { color: 'gray', label: 'Felfüggesztve', icon: Ban },
};

interface ContractorCardProps {
  contractor: {
    id: string;
    display_name: string;
    phone: string;
    type: 'individual' | 'company';
    trades: string[];
    service_areas: string[];
    years_experience?: number;
    status: 'pending_approval' | 'approved' | 'rejected' | 'suspended';
    created_at: string;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onActivate?: (id: string) => void;
  showActions?: boolean;
}

export default function ContractorCard({
  contractor,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  showActions = true,
}: ContractorCardProps) {
  const status = statusConfig[contractor.status] || statusConfig.pending_approval;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-vvm-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-vvm-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{contractor.display_name}</h3>
            <p className="text-sm text-gray-500">
              {contractor.type === 'company' ? 'Cég' : 'Egyéni vállalkozó'}
              {contractor.years_experience && ` • ${contractor.years_experience} év tapasztalat`}
            </p>
          </div>
        </div>
        
        <span className={`inline-flex items-center gap-1 px-3 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-medium`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400" />
          <a href={`tel:${contractor.phone}`} className="text-vvm-blue-600 hover:underline">
            {contractor.phone}
          </a>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {contractor.trades.map((trade) => {
              const Icon = tradeIcons[trade] || Briefcase;
              return (
                <span key={trade} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs">
                  <Icon className="w-3 h-3" />
                  {tradeLabels[trade] || trade}
                </span>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{contractor.service_areas.slice(0, 5).join(', ')}{contractor.service_areas.length > 5 ? ` +${contractor.service_areas.length - 5}` : ''}</span>
        </div>
      </div>

      {/* Actions for pending approval */}
      {showActions && contractor.status === 'pending_approval' && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onApprove?.(contractor.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Jóváhagyás
          </button>
          <button
            onClick={() => onReject?.(contractor.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Elutasítás
          </button>
        </div>
      )}

      {/* Actions for approved - can suspend */}
      {showActions && contractor.status === 'approved' && onSuspend && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onSuspend(contractor.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Ban className="w-4 h-4" />
            Felfüggesztés
          </button>
        </div>
      )}

      {/* Actions for suspended - can reactivate */}
      {showActions && contractor.status === 'suspended' && onActivate && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onActivate(contractor.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            Újraaktiválás
          </button>
        </div>
      )}

      {/* Registration date */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
        Regisztrált: {new Date(contractor.created_at).toLocaleDateString('hu-HU')}
      </div>
    </div>
  );
}
