'use client';

import React, { useState, useRef, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LogIn, Maximize2, Clock, Search } from 'lucide-react';
import { MAPBOX_V11_INSPIRED_DARK } from '@/utils/mapStyles';

interface UnauthMapLibreMapProps {
    onLoginClick: () => void;
    leads: any[];
    getIcon: (type: string) => any;
    getColor: (type: string) => string;
}

export default function UnauthMapLibreMap({ onLoginClick, leads, getIcon, getColor }: UnauthMapLibreMapProps) {
    const [popupInfo, setPopupInfo] = useState<any>(null);
    const mapRef = useRef<MapRef>(null);

    // Initial view centered on the dense cluster of VBF jobs
    const initialViewState = {
        longitude: 19.040,
        latitude: 47.492,
        zoom: 14.8 // Zoomed in tighter to frame the dense group
    };

    // Using the custom "Mapbox v11 Inspired Dark" Style Spec
    const mapStyle = MAPBOX_V11_INSPIRED_DARK;

    return (
        <div className="w-full h-full relative cursor-pointer group">
            <div className="absolute inset-0 z-0">
                <Map
                    ref={mapRef}
                    initialViewState={initialViewState}
                    mapStyle={mapStyle}
                    style={{ width: '100%', height: '100%' }}
                    reuseMaps
                >
                    <NavigationControl position="top-right" showCompass={false} />

                    {leads.map((lead) => (
                        <Marker
                            key={lead.id}
                            longitude={lead.lng}
                            latitude={lead.lat}
                            anchor="center"
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setPopupInfo(lead);
                                mapRef.current?.flyTo({
                                    center: [lead.lng, lead.lat + 0.008],
                                    zoom: 13.5,
                                    duration: 800
                                });
                            }}
                        >
                            <div className="relative group cursor-pointer transition-transform duration-300">
                                {/* Outer pulsing ring */}
                                <div className="absolute -inset-2 bg-slate-500/20 rounded-full animate-ping"></div>

                                {/* Inner pin */}
                                <div className={`relative w-10 h-10 rounded-full ${getColor(lead.type)} shadow-xl flex items-center justify-center border-2 border-white/20 hover:scale-110 transition-transform`}>
                                    {getIcon(lead.type)}
                                </div>

                                {/* Hover Label - Replicating original design */}
                                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1.5 rounded-lg shadow-xl w-max pointer-events-none z-50 border border-slate-100">
                                    <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{lead.title}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">Sürgős (SOS)</div>
                                    </div>
                                    {/* Triangle pointer */}
                                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-white border-l border-b border-slate-100 rotate-45 transform"></div>
                                </div>
                            </div>
                        </Marker>
                    ))}

                    {popupInfo && (
                        <Popup
                            longitude={popupInfo.lng}
                            latitude={popupInfo.lat}
                            anchor="bottom"
                            offset={45}
                            onClose={() => {
                                setPopupInfo(null);
                                mapRef.current?.flyTo({
                                    center: [initialViewState.longitude, initialViewState.latitude],
                                    zoom: initialViewState.zoom,
                                    duration: 800
                                });
                            }}
                            closeOnClick={false}
                            className="z-50 min-w-[300px]"
                            maxWidth="340px"
                        >
                            <div className="p-1">
                                <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                                    <div className={`w-10 h-10 rounded-full ${getColor(popupInfo.type)} flex flex-shrink-0 items-center justify-center text-white shadow-md`}>
                                        {getIcon(popupInfo.type)}
                                    </div>
                                    <div className="flex-1 pr-4">
                                        <h3 className="font-bold text-slate-800 text-base leading-tight mb-0.5">{popupInfo.title}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                            {popupInfo.district || 'Budapest'}
                                        </div>
                                    </div>
                                </div>

                                {popupInfo.description && (
                                    <div className="bg-slate-50/80 rounded-lg p-3 mb-4 text-sm text-slate-600 border border-slate-100 leading-relaxed italic shadow-inner">
                                        &quot;{popupInfo.description}&quot;
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs mb-4 px-1">
                                    <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                                        <Clock className="w-3.5 h-3.5" />
                                        Azonnali SOS
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                        <Search className="w-3.5 h-3.5" />
                                        Szakit keres
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onLoginClick();
                                    }}
                                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Jelentkezz be a részletekért
                                </button>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>

            {/* Hint overlay */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-900/40 to-transparent z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0"></div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-vvm-blue-900/40 to-transparent z-10 pointer-events-none transition-opacity duration-500"></div>

            {/* Top floating controls */}
            <div className="absolute top-4 inset-x-2 sm:inset-x-4 z-20 flex justify-between items-start pointer-events-none">
                {/* Left side decorators (Transparent - matching original) */}
                <div className="text-white flex items-center gap-4 sm:gap-6 pointer-events-auto self-start">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500"></span>
                        </div>
                        <span className="text-[10px] sm:text-[13px] font-bold whitespace-nowrap tracking-wide uppercase drop-shadow-md">Élő Munkák: 643</span>
                    </div>

                    <div className="w-px h-3 sm:h-4 bg-white/20"></div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] sm:text-[13px] font-bold whitespace-nowrap tracking-wide uppercase drop-shadow-md">Aktív szakik: 312</span>
                    </div>
                </div>

                {/* Right side Enlarge Button */}
                <button
                    onClick={onLoginClick}
                    className="bg-gradient-to-r from-vvm-blue-600 to-vvm-blue-700 hover:from-vvm-blue-700 hover:to-vvm-blue-800 text-white font-semibold py-1.5 px-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-blue-500/20 flex items-center gap-2 transition-all transform hover:scale-105 pointer-events-auto shrink-0"
                >
                    <Maximize2 className="w-3.5 h-3.5 text-blue-100" />
                    <span className="text-[11px] whitespace-nowrap">Térkép Kinagyítása</span>
                </button>
            </div>

            {/* Instruction Badge - Full width bottom bar (matching original) */}
            <div className="absolute bottom-0 left-0 w-full z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onLoginClick();
                    }}
                    className="w-full bg-white/90 backdrop-blur-md px-4 py-2 border-t border-white/50 flex flex-row items-center justify-center gap-3 transition-colors cursor-pointer hover:bg-white active:bg-slate-50"
                >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors bg-slate-600/90">
                        <LogIn className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[11px] sm:text-[13px] font-bold text-slate-700">
                        Jelentkezz be, hogy hibát jelenthess vagy munkát vállalj
                    </span>
                </button>
            </div>

            {/* Attribution overlay */}
            <div className="absolute bottom-1 right-1 z-10 text-[10px] text-slate-400 bg-white/50 px-2 py-0.5 rounded pointer-events-none border border-slate-100">
                © OpenFreeMap © OpenStreetMap contributors
            </div>

            <style jsx global>{`
                .maplibregl-canvas {
                    filter: none !important;
                }
                .maplibregl-popup-content {
                    padding: 12px !important;
                    border-radius: 16px !important;
                    overflow: hidden !important;
                    box-shadow: 0 10px 40px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15) !important;
                    background: white !important;
                }
                .maplibregl-popup-close-button {
                    font-size: 24px !important;
                    padding: 8px 12px !important;
                    color: #64748b !important;
                    outline: none !important;
                    right: 4px !important;
                    top: 4px !important;
                    transition: color 0.2s !important;
                }
                .maplibregl-popup-close-button:hover {
                    background-color: transparent !important;
                    color: #0f172a !important;
                }
                .maplibregl-popup-tip {
                    border-top-color: white !important;
                }
                .maplibregl-ctrl-top-right {
                    margin-top: 48px !important;
                }
                .maplibregl-ctrl-group {
                    border-radius: 12px !important;
                    overflow: hidden !important;
                    border: 1px solid rgba(226, 232, 240, 0.8) !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                }
            `}</style>
        </div>
    );
}
