/**
 * Custom MapLibre Style Specification inspired by Mapbox Dark v11.
 * Focused on neutral-warm charcoal tones, layered road strokes, and soft offsets.
 * NO cold/blue tones.
 */

export const MAPBOX_V11_INSPIRED_DARK: any = {
    version: 8,
    name: "Mapbox v11 Inspired Dark",
    metadata: {
        "maputnik:renderer": "mlgljs"
    },
    sources: {
        openmaptiles: {
            type: "vector",
            url: "https://tiles.openfreemap.org/planet"
        }
    },
    sprite: "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    layers: [
        {
            id: "background",
            type: "background",
            paint: {
                "background-color": "#1f1f1f" // Slightly darker core background for higher contrast with roads
            }
        },
        // Water - Deep muted slate grey, not blue
        {
            id: "water",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "water",
            paint: {
                "fill-color": "#2a2c2f"
            }
        },
        // Landuse - Parks/Greenery - Extremely subtle warm grey-green
        {
            id: "landuse_park",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "landuse",
            filter: ["==", "class", "park"],
            paint: {
                "fill-color": "#2b2e2b",
                "fill-opacity": 0.6
            }
        },
        // Building
        {
            id: "building",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "building",
            minzoom: 10,
            paint: {
                "fill-color": "#282828",
                "fill-outline-color": "#2f2f2f"
            }
        },
        // Road Casing - Major Roads
        {
            id: "road_casing_major",
            type: "line",
            source: "openmaptiles",
            "source-layer": "transportation",
            minzoom: 5,
            filter: ["in", "class", "motorway", "trunk", "primary", "secondary", "tertiary"],
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
                "line-color": "#2f2f2f", // Muted warm grey casing
                "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 0.5, 10, 2, 13, 3, 20, 35]
            }
        },
        // Road Inner - Major Roads
        {
            id: "road_inner_major",
            type: "line",
            source: "openmaptiles",
            "source-layer": "transportation",
            minzoom: 5,
            filter: ["in", "class", "motorway", "trunk", "primary", "secondary", "tertiary"],
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
                "line-color": "#3a3a3a", // Slightly lighter warm grey inner
                "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 0.2, 10, 1.2, 13, 2, 20, 30]
            }
        },
        // Minor Roads - Visible when zoomed in, form the dense grid
        {
            id: "road_minor",
            type: "line",
            source: "openmaptiles",
            "source-layer": "transportation",
            minzoom: 11,
            filter: ["in", "class", "minor", "service", "residential", "path", "track"],
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
                "line-color": "#2c2c2c",
                "line-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0.4, 14, 0.8],
                "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 11, 0.5, 15, 1.5, 20, 12]
            }
        },
        // Place Labels
        {
            id: "place_label",
            type: "symbol",
            source: "openmaptiles",
            "source-layer": "place",
            layout: {
                "text-field": "{name:latin}",
                "text-font": ["Noto Sans Regular"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 5, 10, 12, 14],
                "text-transform": "uppercase",
                "text-letter-spacing": 0.1
            },
            paint: {
                "text-color": "#c6c6c6", // Warm light grey
                "text-halo-color": "rgba(30,30,30, 0.7)", // Soft dark halo
                "text-halo-width": 1
            }
        },
        // Road Labels
        {
            id: "road_label",
            type: "symbol",
            source: "openmaptiles",
            "source-layer": "transportation_name",
            layout: {
                "symbol-placement": "line",
                "text-field": "{name:latin}",
                "text-font": ["Noto Sans Regular"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 13, 9, 16, 12]
            },
            paint: {
                "text-color": "#a8a8a8",
                "text-halo-color": "rgba(30,30,30, 0.7)",
                "text-halo-width": 0.8
            }
        }
    ]
};
