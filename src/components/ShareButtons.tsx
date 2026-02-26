'use client';

import { Facebook, Share2, Mail, Instagram } from 'lucide-react';

interface ShareButtonsProps {
    url: string;
    title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
    const shareUrl = encodeURIComponent(url);

    return (
        <div className="flex flex-wrap items-center gap-4 py-6 border-t border-b border-gray-100 my-8">
            <div className="flex items-center gap-2 text-gray-600 font-medium shrink-0">
                <Share2 className="w-5 h-5" />
                <span>Megosztás:</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, 'facebook-share', 'width=600,height=400')}
                    className="bg-[#1877F2] text-white p-2 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Megosztás Facebookon"
                    aria-label="Megosztás Facebookon"
                >
                    <Facebook className="w-5 h-5" />
                </button>
                <button
                    onClick={() => window.open(`fb-messenger://share/?link=${shareUrl}`, 'messenger-share', 'width=600,height=400')}
                    className="bg-[#00B2FF] text-white p-2 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Küldés Messengeren"
                    aria-label="Küldés Messengeren"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.9 1.464 5.485 3.755 7.127a.5.5 0 0 1 .206.52l-.46 2.652c-.11.636.52.887.942.502l2.67-2.433a.498.498 0 0 1 .325-.13c.846.16 1.733.25 2.562.25 5.522 0 10-4.145 10-9.258C22 6.145 17.522 2 12 2zm1.096 10.662l-2.46-2.61a.91.91 0 0 0-1.348-.057l-2.73 2.899c-.39.414-.047 1.057.531.954l2.585-.458a.91.91 0 0 1 .844.298l2.46 2.61c.365.387 1.012.396 1.348.057l2.73-2.899c.39-.414.047-1.057-.531-.954l-2.585.458a.91.91 0 0 1-.844-.298z" />
                    </svg>
                </button>
                <button
                    onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, 'whatsapp-share', 'width=600,height=400')}
                    className="bg-[#25D366] text-white p-2 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Küldés WhatsAppon"
                    aria-label="Küldés WhatsAppon"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </button>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(url);
                        alert('A link vágólapra másolva. Beillesztheted egy Instagram üzenetbe!');
                        window.open('https://instagram.com', '_blank');
                    }}
                    className="bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white p-2 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Megnyitás Instagramon"
                    aria-label="Megnyitás Instagramon"
                >
                    <Instagram className="w-5 h-5" />
                </button>
                <a
                    href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Nézd meg ezt a cikket: ' + url)}`}
                    className="bg-gray-600 text-white p-2 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Küldés Emailben"
                    aria-label="Küldés Emailben"
                >
                    <Mail className="w-5 h-5" />
                </a>
            </div>
        </div>
    );
}
