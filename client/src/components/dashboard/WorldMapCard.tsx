import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const MARKET_HUBS = [
  { name: 'New York',   lat: 40.7128,  lng: -74.006,  index: 'S&P 500',   value: '5,823',  change: '+0.42%', pos: true  },
  { name: 'London',     lat: 51.5074,  lng: -0.1278,  index: 'FTSE 100',  value: '7,689',  change: '-0.33%', pos: false },
  { name: 'Tokyo',      lat: 35.6762,  lng: 139.6503, index: 'Nikkei',    value: '38,542', change: '+1.02%', pos: true  },
  { name: 'Hong Kong',  lat: 22.3193,  lng: 114.1694, index: 'HSI',       value: '16,782', change: '-0.58%', pos: false },
  { name: 'Singapore',  lat: 1.3521,   lng: 103.8198, index: 'STI',       value: '3,241',  change: '+0.21%', pos: true  },
  { name: 'Mumbai',     lat: 19.076,   lng: 72.8777,  index: 'Nifty 50',  value: '24,351', change: '-0.21%', pos: false },
  { name: 'Frankfurt',  lat: 50.1109,  lng: 8.6821,   index: 'DAX',       value: '18,452', change: '+0.55%', pos: true  },
  { name: 'Shanghai',   lat: 31.2304,  lng: 121.4737, index: 'SSE',       value: '2,987',  change: '+0.24%', pos: true  },
  { name: 'Sydney',     lat: -33.8688, lng: 151.2093, index: 'ASX 200',   value: '7,645',  change: '+0.31%', pos: true  },
  { name: 'Toronto',    lat: 43.6532,  lng: -79.3832, index: 'TSX',       value: '21,847', change: '+0.18%', pos: true  },
  { name: 'São Paulo',  lat: -23.5505, lng: -46.6333, index: 'Bovespa',   value: '127,430',change: '-0.67%', pos: false },
  { name: 'Dubai',      lat: 25.2048,  lng: 55.2708,  index: 'DFM',       value: '4,218',  change: '+0.44%', pos: true  },
];

export function WorldMapCard() {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon path (Leaflet + bundlers issue)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [20, 10],
        zoom: 2,
        minZoom: 1,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // ── Satellite tile layer (ESRI World Imagery — free, no key) ──────────
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles © Esri &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics',
          maxZoom: 18,
        }
      ).addTo(map);

      // ── Labels overlay (semi-transparent, so cities/countries visible) ────
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, opacity: 0.6 }
      ).addTo(map);

      // ── Custom zoom control ───────────────────────────────────────────────
      L.control.zoom({ position: 'topright' }).addTo(map);

      // ── Market hub markers ────────────────────────────────────────────────
      MARKET_HUBS.forEach((hub) => {
        const color  = hub.pos ? '#10b981' : '#ef4444';
        const change = hub.pos ? `▲ ${hub.change}` : `▼ ${hub.change}`;

        // SVG pulse marker
        const icon = L.divIcon({
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          html: `
            <div style="position:relative;width:20px;height:20px">
              <div style="
                position:absolute;inset:0;border-radius:50%;
                background:${color};opacity:0.25;
                animation:pulse 2s ease-out infinite;
              "></div>
              <div style="
                position:absolute;top:5px;left:5px;width:10px;height:10px;
                border-radius:50%;background:${color};
                border:1.5px solid rgba(0,0,0,0.5);
              "></div>
            </div>
          `,
        });

        const popup = L.popup({
          className: 'market-popup',
          closeButton: false,
          offset: [0, -6],
          maxWidth: 160,
        }).setContent(`
          <div style="
            background:#1e293b;border:1px solid #334155;border-radius:6px;
            padding:8px 10px;font-family:system-ui,sans-serif;min-width:130px;
          ">
            <div style="font-weight:600;font-size:12px;color:#f1f5f9;margin-bottom:4px">${hub.name}</div>
            <div style="font-size:10px;color:#94a3b8;margin-bottom:2px">${hub.index}</div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:12px;font-weight:500;color:#f1f5f9">${hub.value}</span>
              <span style="font-size:11px;font-weight:600;color:${color}">${change}</span>
            </div>
          </div>
        `);

        const marker = L.marker([hub.lat, hub.lng], { icon });
        marker.addTo(map);
        marker.on('click', () => marker.bindPopup(popup).openPopup());
        marker.on('mouseover', () => marker.bindPopup(popup).openPopup());
        marker.on('mouseout', () => map.closePopup());
      });

      leafletRef.current = map;
      setReady(true);
    });

    return () => {
      leafletRef.current?.remove();
      leafletRef.current = null;
    };
  }, []);

  // Invalidate map size when card is resized
  useEffect(() => {
    if (!leafletRef.current) return;
    const ro = new ResizeObserver(() => leafletRef.current?.invalidateSize());
    if (mapRef.current) ro.observe(mapRef.current);
    return () => ro.disconnect();
  }, [ready]);

  return (
    <>
      {/* Pulse animation for markers */}
      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 0.4; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip-container { display:none !important; }
        .market-popup .leaflet-popup-content-wrapper {
          display:block !important;
          background:transparent;
          border:none;
          box-shadow:none;
          padding:0;
        }
        .market-popup .leaflet-popup-content { margin:0; }
      `}</style>

      <div ref={mapRef} className="h-full w-full rounded overflow-hidden" style={{ minHeight: 120 }}>
        {!ready && (
          <div className="flex h-full items-center justify-center text-xs text-text-secondary" style={{ background: '#0a0f1e' }}>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Loading satellite map…
          </div>
        )}
      </div>
    </>
  );
}
