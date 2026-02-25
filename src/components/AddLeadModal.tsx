import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { X, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AddLeadModalProps {
    lat: number;
    lng: number;
    userId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const CATEGORIES = [
    { id: 'viz', label: 'Vízszerelés', icon: '💧', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    { id: 'villany', label: 'Villanyszerelés', icon: '⚡', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'futes', label: 'Fűtésszerelés', icon: '🔥', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'egyeb', label: 'Egyéb', icon: '🔧', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

// Budapest districts with approximate center coordinates
const BUDAPEST_DISTRICTS = [
    { id: 'I', label: 'I. kerület (Budavár)', lat: 47.496, lng: 19.039 },
    { id: 'II', label: 'II. kerület (Rózsadomb)', lat: 47.528, lng: 18.990 },
    { id: 'III', label: 'III. kerület (Óbuda)', lat: 47.551, lng: 19.041 },
    { id: 'IV', label: 'IV. kerület (Újpest)', lat: 47.567, lng: 19.085 },
    { id: 'V', label: 'V. kerület (Belváros)', lat: 47.500, lng: 19.054 },
    { id: 'VI', label: 'VI. kerület (Terézváros)', lat: 47.509, lng: 19.065 },
    { id: 'VII', label: 'VII. kerület (Erzsébetváros)', lat: 47.501, lng: 19.075 },
    { id: 'VIII', label: 'VIII. kerület (Józsefváros)', lat: 47.491, lng: 19.076 },
    { id: 'IX', label: 'IX. kerület (Ferencváros)', lat: 47.478, lng: 19.068 },
    { id: 'X', label: 'X. kerület (Kőbánya)', lat: 47.485, lng: 19.132 },
    { id: 'XI', label: 'XI. kerület (Újbuda)', lat: 47.462, lng: 19.020 },
    { id: 'XII', label: 'XII. kerület (Hegyvidék)', lat: 47.488, lng: 18.990 },
    { id: 'XIII', label: 'XIII. kerület (Angyalföld)', lat: 47.530, lng: 19.072 },
    { id: 'XIV', label: 'XIV. kerület (Zugló)', lat: 47.515, lng: 19.100 },
    { id: 'XV', label: 'XV. kerület (Rákospalota)', lat: 47.560, lng: 19.110 },
    { id: 'XVI', label: 'XVI. kerület (Árpádföld)', lat: 47.520, lng: 19.175 },
    { id: 'XVII', label: 'XVII. kerület (Rákosmente)', lat: 47.480, lng: 19.220 },
    { id: 'XVIII', label: 'XVIII. kerület (Pestszentlőrinc)', lat: 47.440, lng: 19.165 },
    { id: 'XIX', label: 'XIX. kerület (Kispest)', lat: 47.452, lng: 19.135 },
    { id: 'XX', label: 'XX. kerület (Pesterzsébet)', lat: 47.435, lng: 19.095 },
    { id: 'XXI', label: 'XXI. kerület (Csepel)', lat: 47.415, lng: 19.078 },
    { id: 'XXII', label: 'XXII. kerület (Budafok)', lat: 47.420, lng: 18.985 },
    { id: 'XXIII', label: 'XXIII. kerület (Soroksár)', lat: 47.395, lng: 19.110 },
];

// Pest-megye settlements with postal codes
const PEST_MEGYE = [
    { zip: '2000', label: 'Szentendre', lat: 47.670, lng: 19.075 },
    { zip: '2030', label: 'Érd', lat: 47.385, lng: 18.921 },
    { zip: '2040', label: 'Budaörs', lat: 47.460, lng: 18.945 },
    { zip: '2049', label: 'Diósd', lat: 47.405, lng: 18.940 },
    { zip: '2051', label: 'Biatorbágy', lat: 47.475, lng: 18.820 },
    { zip: '2060', label: 'Bicske', lat: 47.485, lng: 18.635 },
    { zip: '2100', label: 'Gödöllő', lat: 47.595, lng: 19.355 },
    { zip: '2120', label: 'Dunakeszi', lat: 47.635, lng: 19.125 },
    { zip: '2131', label: 'Göd', lat: 47.685, lng: 19.135 },
    { zip: '2141', label: 'Csömör', lat: 47.553, lng: 19.175 },
    { zip: '2142', label: 'Nagytarcsa', lat: 47.540, lng: 19.210 },
    { zip: '2143', label: 'Kistarcsa', lat: 47.545, lng: 19.260 },
    { zip: '2144', label: 'Kerepes', lat: 47.555, lng: 19.275 },
    { zip: '2145', label: 'Szilasliget', lat: 47.560, lng: 19.290 },
    { zip: '2151', label: 'Fót', lat: 47.615, lng: 19.175 },
    { zip: '2161', label: 'Csomád', lat: 47.620, lng: 19.125 },
    { zip: '2220', label: 'Vecsés', lat: 47.405, lng: 19.265 },
    { zip: '2225', label: 'Üllő', lat: 47.385, lng: 19.345 },
    { zip: '2230', label: 'Gyömrő', lat: 47.430, lng: 19.395 },
    { zip: '2310', label: 'Szigetszentmiklós', lat: 47.345, lng: 19.040 },
    { zip: '2330', label: 'Dunaharaszti', lat: 47.360, lng: 19.075 },
    { zip: '2340', label: 'Kiskunlacháza', lat: 47.230, lng: 19.015 },
    { zip: '2360', label: 'Gyál', lat: 47.385, lng: 19.225 },
    { zip: '2370', label: 'Dabas', lat: 47.185, lng: 19.315 },
    { zip: '2440', label: 'Százhalombatta', lat: 47.320, lng: 18.920 },
    { zip: '2600', label: 'Vác', lat: 47.780, lng: 19.125 },
    { zip: '2700', label: 'Cegléd', lat: 47.175, lng: 19.800 },
    { zip: '2740', label: 'Abony', lat: 47.190, lng: 20.010 },
    { zip: '2800', label: 'Tatabánya', lat: 47.565, lng: 18.385 },
    { zip: '2092', label: 'Budakeszi', lat: 47.510, lng: 18.925 },
    { zip: '2094', label: 'Nagykovácsi', lat: 47.570, lng: 18.890 },
    { zip: '2096', label: 'Üröm', lat: 47.590, lng: 19.010 },
];

export default function AddLeadModal({ lat, lng, userId, onClose, onSuccess }: AddLeadModalProps) {
    const [type, setType] = useState('viz');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [locationType, setLocationType] = useState<'budapest' | 'pest'>('budapest');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedZip, setSelectedZip] = useState('');
    const [street, setStreet] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get the final lat/lng based on selected location (with small random offset so pins don't stack)
    const finalCoords = useMemo(() => {
        const jitter = () => (Math.random() - 0.5) * 0.008; // ~400m jitter
        if (locationType === 'budapest' && selectedDistrict) {
            const d = BUDAPEST_DISTRICTS.find(d => d.id === selectedDistrict);
            if (d) return { lat: d.lat + jitter(), lng: d.lng + jitter() };
        }
        if (locationType === 'pest' && selectedZip) {
            const z = PEST_MEGYE.find(z => z.zip === selectedZip);
            if (z) return { lat: z.lat + jitter(), lng: z.lng + jitter() };
        }
        return { lat: lat + jitter(), lng: lng + jitter() };
    }, [locationType, selectedDistrict, selectedZip, lat, lng]);

    // Build the district display string
    const districtLabel = useMemo(() => {
        if (locationType === 'budapest' && selectedDistrict) {
            const d = BUDAPEST_DISTRICTS.find(d => d.id === selectedDistrict);
            return `Budapest, ${d?.label || selectedDistrict + '. kerület'}`;
        }
        if (locationType === 'pest' && selectedZip) {
            const z = PEST_MEGYE.find(z => z.zip === selectedZip);
            return `${z?.zip || ''} ${z?.label || ''}`;
        }
        return 'Budapest';
    }, [locationType, selectedDistrict, selectedZip]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const fullDistrict = street ? `${districtLabel}, ${street}` : districtLabel;
            const { error: insertError } = await supabase.from('leads').insert({
                user_id: userId,
                lat: finalCoords.lat,
                lng: finalCoords.lng,
                type,
                title,
                description,
                district: fullDistrict,
                status: 'waiting'
            });

            if (insertError) throw insertError;

            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Hiba történt a mentés során.');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = title && description && street && (
        (locationType === 'budapest' && selectedDistrict) ||
        (locationType === 'pest' && selectedZip)
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Hiba Bejelentése</h2>
                            <p className="text-xs font-semibold text-slate-400">
                                Probléma helyszínének és leírásának rögzítése
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body (scrollable) */}
                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form id="add-lead-form" onSubmit={handleSubmit} className="space-y-5">

                        {/* Category selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Milyen típusú probléma?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setType(cat.id)}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-sm ${type === cat.id
                                            ? `border-slate-800 bg-slate-50 shadow-sm`
                                            : `border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600`
                                            }`}
                                    >
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${cat.color}`}>
                                            {cat.icon}
                                        </div>
                                        <span className={`font-bold ${type === cat.id ? 'text-slate-800' : ''}`}>
                                            {cat.label}
                                        </span>
                                        {type === cat.id && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-800 ml-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location Type Toggle */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Hol van a probléma?</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setLocationType('budapest'); setSelectedZip(''); }}
                                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm border-2 transition-all ${locationType === 'budapest'
                                        ? 'border-slate-800 bg-slate-50 text-slate-800'
                                        : 'border-slate-100 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    🏙️ Budapest
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setLocationType('pest'); setSelectedDistrict(''); }}
                                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm border-2 transition-all ${locationType === 'pest'
                                        ? 'border-slate-800 bg-slate-50 text-slate-800'
                                        : 'border-slate-100 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    🏘️ Pest megye
                                </button>
                            </div>
                        </div>

                        {/* District or Postal Code selector */}
                        {locationType === 'budapest' ? (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Kerület <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all font-medium text-sm bg-white"
                                >
                                    <option value="">Válassz kerületet...</option>
                                    {BUDAPEST_DISTRICTS.map((d) => (
                                        <option key={d.id} value={d.id}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Település / Irányítószám <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={selectedZip}
                                    onChange={(e) => setSelectedZip(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all font-medium text-sm bg-white"
                                >
                                    <option value="">Válassz települést...</option>
                                    {PEST_MEGYE.map((z) => (
                                        <option key={z.zip} value={z.zip}>{z.zip} — {z.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Street input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Utca, házszám <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                                placeholder="Pl.: Kossuth Lajos utca 12."
                            />
                        </div>

                        {/* Title input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Rövid megnevezés <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                                placeholder="Pl.: Csöpög a radiátor szelepe"
                                maxLength={50}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                                Részletes leírás
                                <span className="text-red-500 font-bold text-xs mt-0.5">* Kötelező</span>
                            </label>
                            <textarea
                                value={description}
                                required
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all placeholder:text-slate-400 resize-none text-sm"
                                placeholder="Mióta áll fenn a probléma? Próbáltad már javítani?"
                                maxLength={300}
                            />
                        </div>

                    </form>
                </div>

                {/* Footer (Sticky) */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors"
                    >
                        Mégse
                    </button>
                    <button
                        type="submit"
                        form="add-lead-form"
                        disabled={loading || !isFormValid}
                        className="flex-[2] bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-800/20 transition-all flex items-center justify-center"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Közzététel a Térképen'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
