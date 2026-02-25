'use client';

import { Facebook, Share2 } from 'lucide-react';

interface ShareButtonsProps {
    url: string;
    title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
    const shareUrl = encodeURIComponent(url);

    return (
        <div className="flex items-center gap-4 py-6 border-t border-b border-gray-100 my-8">
            <div className="flex items-center gap-2 text-gray-600 font-medium">
                <Share2 className="w-5 h-5" />
                <span>Megosztás:</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, 'facebook-share', 'width=600,height=400')}
                    className="bg-[#1877F2] text-white p-2 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    title="Megosztás Facebookon"
                    aria-label="Megosztás Facebookon"
                >
                    <Facebook className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
