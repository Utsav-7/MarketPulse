import { useCallback, useEffect, useRef, useState } from 'react';

// ── Solar subsolar-point ─────────────────────────────────────────────────────
function getSolarLatLng(date: Date): { lat: number; lng: number } {
  const JD  = date.getTime() / 86_400_000 + 2_440_587.5;
  const n   = JD - 2_451_545.0;
  const L   = (280.46 + 0.9856474 * n) % 360;
  const g   = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);
  const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * (Math.PI / 180);
  const eps = 23.439 * (Math.PI / 180);
  const lat = Math.asin(Math.sin(eps) * Math.sin(lam)) * (180 / Math.PI);
  const GMST = (18.697375 + 24.065709824279 * n) % 24;
  const RA   = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  const lng  = ((RA * (180 / Math.PI) / 15 - GMST) * 15 + 540) % 360 - 180;
  return { lat, lng };
}

// Convert subsolar lat/lng → Three.js world-space unit vector
function sunVector(lat: number, lng: number): [number, number, number] {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
     Math.sin(phi) * Math.cos(theta),
     Math.cos(phi),
    -Math.sin(phi) * Math.sin(theta),
  ];
}

// ── Shader: blends day + NASA city-lights textures at the terminator ─────────
const VERT = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = `
  uniform sampler2D dayTex;
  uniform sampler2D nightTex;
  uniform vec3      sunDir;
  varying vec2      vUv;
  varying vec3      vWorldNormal;

  void main() {
    float cosA    = dot(normalize(vWorldNormal), normalize(sunDir));
    // Wide soft terminator: twilight band ≈ ±18° around the terminator
    float dayMix  = smoothstep(-0.3, 0.3, cosA);

    vec4 day   = texture2D(dayTex,   vUv);
    vec4 night = texture2D(nightTex, vUv);

    // Night side: city lights at full brightness; dim day contribution
    // Day side:   full day texture; night lights invisible
    vec4 color = mix(night * 1.0, day, dayMix);
    gl_FragColor = color;
  }
`;

// ── Financial hubs ────────────────────────────────────────────────────────────
const ARC_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const HUBS = [
  { lat: 40.7128,  lng: -74.006,  label: 'New York',   color: '#3b82f6' },
  { lat: 51.5074,  lng: -0.1278,  label: 'London',     color: '#10b981' },
  { lat: 35.6762,  lng: 139.6503, label: 'Tokyo',      color: '#f59e0b' },
  { lat: 22.3193,  lng: 114.1694, label: 'Hong Kong',  color: '#ef4444' },
  { lat: 1.3521,   lng: 103.8198, label: 'Singapore',  color: '#8b5cf6' },
  { lat: 19.076,   lng: 72.8777,  label: 'Mumbai',     color: '#06b6d4' },
  { lat: 48.8566,  lng: 2.3522,   label: 'Paris',      color: '#f97316' },
  { lat: 52.52,    lng: 13.405,   label: 'Frankfurt',  color: '#84cc16' },
  { lat: 31.2304,  lng: 121.4737, label: 'Shanghai',   color: '#ec4899' },
  { lat: -33.8688, lng: 151.2093, label: 'Sydney',     color: '#14b8a6' },
];

function buildArcs() {
  const arcs: any[] = [];
  for (let i = 0; i < 14; i++) {
    const src = HUBS[Math.floor(Math.random() * HUBS.length)];
    const dst = HUBS[Math.floor(Math.random() * HUBS.length)];
    if (src === dst) continue;
    arcs.push({
      startLat: src.lat, startLng: src.lng,
      endLat:   dst.lat, endLng:   dst.lng,
      color: ARC_COLORS[Math.floor(Math.random() * ARC_COLORS.length)],
    });
  }
  return arcs;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function GlobeCard() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const globeRef      = useRef<any>(null);
  const materialRef   = useRef<any>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const arcs          = useRef(buildArcs());

  const [size, setSize]          = useState({ w: 0, h: 0 });
  const [GlobeComp, setGlobeComp] = useState<any>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    import('react-globe.gl').then((m) => setGlobeComp(() => m.default));
  }, []);

  const applyShader = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    import('three').then((THREE) => {
      const loader = new THREE.TextureLoader();
      Promise.all([
        loader.loadAsync('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
        loader.loadAsync('//unpkg.com/three-globe/example/img/earth-night.jpg'),
      ]).then(([dayTex, nightTex]) => {
        // Correct texture orientation
        dayTex.flipY   = true;
        nightTex.flipY = true;

        const solar = getSolarLatLng(new Date());
        const [sx, sy, sz] = sunVector(solar.lat, solar.lng);

        const mat = new THREE.ShaderMaterial({
          uniforms: {
            dayTex:   { value: dayTex },
            nightTex: { value: nightTex },
            sunDir:   { value: new THREE.Vector3(sx, sy, sz) },
          },
          vertexShader:   VERT,
          fragmentShader: FRAG,
        });

        // Find the globe sphere — largest SphereGeometry in the scene
        let best: any = null;
        globe.scene().traverse((obj: any) => {
          if (obj.isMesh && obj.geometry) {
            const r = obj.geometry.parameters?.radius ?? 0;
            if (!best || r > (best.geometry.parameters?.radius ?? 0)) best = obj;
          }
        });

        if (best) {
          best.material = mat;
          materialRef.current = mat;
        }

        // Refresh sun direction every 60 s
        timerRef.current = setInterval(() => {
          const s = getSolarLatLng(new Date());
          const [x, y, z] = sunVector(s.lat, s.lng);
          materialRef.current?.uniforms.sunDir.value.set(x, y, z);
        }, 60_000);
      });
    });
  }, []);

  const onGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const ctrl = globe.controls();
    ctrl.autoRotate      = true;
    ctrl.autoRotateSpeed = 0.45;
    globe.pointOfView({ lat: 20, lng: 10, altitude: 2.0 }, 0);
    applyShader();
  }, [applyShader]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden rounded" style={{ background: '#000408' }}>
      {GlobeComp && size.w > 0 && size.h > 0 ? (
        <GlobeComp
          ref={globeRef}
          onGlobeReady={onGlobeReady}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          atmosphereColor="#3a7bd5"
          atmosphereAltitude={0.20}
          showGraticules={false}
          pointsData={HUBS}
          pointLat="lat" pointLng="lng" pointColor="color"
          pointAltitude={0.012} pointRadius={0.38} pointLabel="label"
          arcsData={arcs.current}
          arcStartLat="startLat" arcStartLng="startLng"
          arcEndLat="endLat"   arcEndLng="endLng"
          arcColor="color" arcAltitude={0.28} arcStroke={0.45}
          arcDashLength={0.4} arcDashGap={0.2} arcDashAnimateTime={2200}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-text-secondary">
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Loading globe…
        </div>
      )}
    </div>
  );
}
