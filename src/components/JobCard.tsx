'use client';

import {
  Droplets, Zap, Flame, MapPin, Phone, Clock,
  CheckCircle, XCircle, Play, AlertTriangle, User,
  Calendar, Camera
} from 'lucide-react';

// Trade icons and colors
const tradeConfig = {
  viz: { icon: Droplets, color: 'sky', label: 'Vízszerelés' },
  villany: { icon: Zap, color: 'amber', label: 'Villanyszerelés' },
  futes: { icon: Flame, color: 'orange', label: 'Fűtésszerelés' },
  combined: { icon: Droplets, color: 'purple', label: 'Kombinált' },
};

const statusConfig = {
  new: { color: 'blue', label: 'Új' },
  unassigned: { color: 'gray', label: 'Kiosztásra vár' },
  assigned: { color: 'yellow', label: 'Kiosztva' },
  scheduled: { color: 'indigo', label: 'Beütemezve' },
  in_progress: { color: 'blue', label: 'Folyamatban' },
  completed: { color: 'green', label: 'Befejezve' },
  cancelled: { color: 'red', label: 'Törölve' },
  pending: { color: 'yellow', label: 'Függőben' },
  accepted: { color: 'green', label: 'Elfogadva' },
  declined: { color: 'red', label: 'Nem vállalta' },
  rejected: { color: 'red', label: 'Elutasítva' },
  withdrawn: { color: 'gray', label: 'Visszavonta' },
};

const priorityConfig = {
  normal: { color: 'gray', label: 'Normál' },
  high: { color: 'amber', label: 'Magas' },
  critical: { color: 'red', label: 'Sürgős' },
};

const categoryConfig = {
  sos: { color: 'red', label: 'SOS' },
  standard: { color: 'gray', label: 'Standard' },
  b2b_project: { color: 'purple', label: 'B2B' },
};

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description?: string;
    trade: 'viz' | 'villany' | 'futes' | 'combined';
    category: 'sos' | 'standard' | 'b2b_project';
    status: string;
    priority: 'normal' | 'high' | 'critical';
    preferred_time_from?: string;
    preferred_time_to?: string;
    created_at?: string;
    updated_at?: string;
    started_at?: string;
    completed_at?: string;
    customer?: {
      full_name: string;
      phone: string;
      email?: string;
    };
    address?: {
      city: string;
      district?: string;
      street: string;
      house_number: string;
    };
    district_or_city?: string;
    lead_price?: number;
    photo_urls?: string[] | null;
    // For admin view - assignments with contractor info
    assignments?: {
      id: string;
      status: string;
      notes?: string;
      updated_at?: string;
      declined_at?: string;
      accepted_at?: string;
      contractor?: {
        id: string;
        display_name: string;
        phone: string;
      };
    }[];
  };
  assignment?: {
    id: string;
    status: 'pending' | 'accepted' | 'declined' | 'rejected' | 'withdrawn' | 'cancelled';
    proposed_start_time?: string;
    confirmed_start_time?: string;
  };
  onAccept?: (assignmentId: string) => void;
  onDecline?: (assignmentId: string) => void;
  onStart?: (jobId: string) => void;
  onComplete?: (jobId: string) => void;
  onUnlock?: (jobId: string, price: number) => void;
  showActions?: boolean;
  compact?: boolean;
  showAssignedContractor?: boolean; // For admin view
}

export default function JobCard({
  job,
  assignment,
  onAccept,
  onDecline,
  onStart,
  onComplete,
  onUnlock,
  showActions = true,
  compact = false,
  showAssignedContractor = false,
}: JobCardProps) {
  const trade = tradeConfig[job.trade] || tradeConfig.viz;
  const TradeIcon = trade.icon;
  const status = statusConfig[assignment?.status || job.status as keyof typeof statusConfig] || statusConfig.new;
  const priority = priorityConfig[job.priority] || priorityConfig.normal;
  const category = categoryConfig[job.category] || categoryConfig.standard;

  // Get the active assignment (not declined/cancelled) for admin view
  const activeAssignment = job.assignments?.find(a =>
    a.status === 'pending' || a.status === 'accepted'
  );
  const hasDeclinedAssignments = job.assignments?.some(a => a.status === 'declined');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('hu-HU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = () => {
    // Determine the full address details if the relation is available
    if (job.address) {
      const { city, district, street, house_number } = job.address;
      // If we only show the partial address when open, just use district summary
      if (job.status === 'open') {
        return job.district_or_city || `${city}${district ? ` ${district}. ker.` : ''}`;
      }
      return `${city}${district ? ` ${district}. ker.` : ''}, ${street} ${house_number}`;
    }

    // Fallback to exactly what the customer typed or the summarized district_or_city
    return job.district_or_city || 'Cím nem elérhető';
  };

  const getBgClass = () => {
    if (assignment?.status === 'pending') return 'bg-sky-50/50 border-sky-200';
    if (assignment?.status === 'accepted') return 'bg-emerald-50/50 border-emerald-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div className={`${getBgClass()} rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${trade.color}-100 rounded-xl flex items-center justify-center`}>
            <TradeIcon className={`w-5 h-5 text-${trade.color}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-500">{trade.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.category === 'sos' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              SOS
            </span>
          )}
          {job.priority === 'critical' && job.category !== 'sos' && (
            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              Sürgős
            </span>
          )}
          {job.priority === 'high' && (
            <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              Kiemelt
            </span>
          )}
          <span className={`inline-flex items-center px-2 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-xs font-medium`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Description */}
      {!compact && job.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
      )}

      {/* Photo thumbnails */}
      {job.photo_urls && job.photo_urls.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>{job.photo_urls.length} fotó</span>
          </div>
          <div className="flex gap-2">
            {job.photo_urls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <img src={url} alt={`Fotó ${idx + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4">
        {job.customer && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400 min-w-[16px]" />
              <span>{job.customer.full_name}</span>
            </div>

            {/* Contact details only visible if accepted/assigned to this contractor */}
            {assignment?.status === 'accepted' && (
              <div className="flex flex-col gap-1 ml-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-vvm-blue-500" />
                  {job.customer.phone && job.customer.phone.trim() !== '' ? (
                    <a href={`tel:${job.customer.phone}`} className="text-vvm-blue-600 hover:underline font-medium">
                      {job.customer.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Nincs megadva telefonszám</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-vvm-blue-500 text-xs font-bold">@</span>
                  {job.customer.email && job.customer.email.trim() !== '' ? (
                    <a href={`mailto:${job.customer.email}`} className="text-vvm-blue-600 hover:underline">
                      {job.customer.email}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Nincs megadva email</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{formatAddress()}</span>
        </div>

        {(job.preferred_time_from || assignment?.confirmed_start_time || assignment?.proposed_start_time) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {assignment?.confirmed_start_time
                ? `Megerősítve: ${formatDate(assignment.confirmed_start_time)}`
                : assignment?.proposed_start_time
                  ? `Javasolt: ${formatDate(assignment.proposed_start_time)}`
                  : `Preferált: ${formatDate(job.preferred_time_from)}`
              }
            </span>
          </div>
        )}
      </div>

      {/* Assigned Contractor Info (for admin view) */}
      {showAssignedContractor && activeAssignment?.contractor && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Kiosztva:</span>
            <span className="text-blue-800">{activeAssignment.contractor.display_name}</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${activeAssignment.status === 'accepted'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
              }`}>
              {activeAssignment.status === 'accepted' ? 'Elfogadva' : 'Válaszra vár'}
            </span>
          </div>
          {activeAssignment.contractor.phone && (
            <div className="flex items-center gap-2 text-sm mt-1 ml-6">
              <Phone className="w-3 h-3 text-blue-400" />
              <a href={`tel:${activeAssignment.contractor.phone}`} className="text-blue-600 hover:underline">
                {activeAssignment.contractor.phone}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Decline history for admin - show who declined and when */}
      {showAssignedContractor && hasDeclinedAssignments && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-amber-800 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="font-medium">
              {!activeAssignment ? 'Elutasítva - újrakiosztás szükséges' : 'Korábbi elutasítások'}
            </span>
          </div>
          {/* Show each decline */}
          <div className="space-y-1 ml-6">
            {job.assignments?.filter(a => a.status === 'declined').map((a, idx) => (
              <div key={idx} className="text-xs text-amber-700">
                <span className="font-medium">{a.contractor?.display_name || 'Ismeretlen'}</span>
                {' - '}
                <span>{formatDate(a.declined_at || a.updated_at)}</span>
                {a.notes && <span className="ml-1 text-amber-600">({a.notes})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion info - show when the job was completed */}
      {job.status === 'completed' && (job.completed_at || job.updated_at) && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium">Befejezve: {formatDate(job.completed_at || job.updated_at)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 mt-4">
          {/* Marketplace Open Job - show unlock */}
          {job.status === 'open' && (
            <button
              onClick={() => onUnlock?.(job.id, job.lead_price || 0)}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-vvm-blue-600 to-vvm-blue-700 hover:from-vvm-blue-700 hover:to-vvm-blue-800 text-white rounded-lg text-sm font-bold transition-transform transform hover:scale-[1.02] shadow-md shadow-blue-600/20"
            >
              <Zap className="w-4 h-4" />
              Elvállalom (-{job.lead_price || 0} Kredit)
            </button>
          )}

          {/* Pending assignment - show accept/decline ONLY if callbacks exist */}
          {assignment?.status === 'pending' && (onAccept || onDecline) && (
            <>
              {onAccept && (
                <button
                  onClick={() => onAccept?.(assignment.id)}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Elfogadom
                </button>
              )}
              {onDecline && (
                <button
                  onClick={() => onDecline?.(assignment.id)}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Elutasítom
                </button>
              )}
            </>
          )}

          {/* Pending assignment - show pending approval message (for contractors waiting on customer) */}
          {assignment?.status === 'pending' && (!onAccept && !onDecline) && (
            <div className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-bold shadow-sm">
              <Clock className="w-4 h-4" />
              Folyamatban: amint az ügyfél jóváhagyja, megkapod az elérhetőséget
            </div>
          )}

          {/* Rejected/Withdrawn assignment */}
          {(assignment?.status === 'rejected' || assignment?.status === 'withdrawn') && (
            <div className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold shadow-sm">
              <XCircle className="w-4 h-4" />
              Az ügyfél nem választott ki. A kredit visszajárt.
            </div>
          )}

          {/* Accepted assignment - show start (for scheduled or assigned jobs) */}
          {assignment?.status === 'accepted' && (job.status === 'scheduled' || job.status === 'assigned') && (
            <button
              onClick={() => onStart?.(job.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-vvm-blue-600 hover:bg-vvm-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Munka elkezdése
            </button>
          )}

          {/* In progress - show complete */}
          {assignment?.status === 'accepted' && job.status === 'in_progress' && (
            <button
              onClick={() => onComplete?.(job.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Munka befejezése
            </button>
          )}

          {/* Completed - show badge */}
          {job.status === 'completed' && (
            <div className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Befejezve
            </div>
          )}
        </div>
      )}
    </div>
  );
}
