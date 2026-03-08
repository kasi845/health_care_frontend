import { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Baby, Building2, Eye, Leaf, User, Users } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Fix default marker icon in Vite (correct paths for bundled assets)
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DefaultIcon = L.Icon.Default as any;
DefaultIcon.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

export type HospitalCategoryId =
  | "pediatric"
  | "multicare"
  | "eye"
  | "skin"
  | "andrologist"
  | "gynecologist";

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  category: HospitalCategoryId;
}

export const HOSPITAL_CATEGORIES: { id: HospitalCategoryId; label: string; icon: React.ReactNode }[] = [
  { id: "pediatric", label: "Pediatric", icon: <Baby className="w-4 h-4" /> },
  { id: "multicare", label: "Multi care", icon: <Building2 className="w-4 h-4" /> },
  { id: "eye", label: "Eye", icon: <Eye className="w-4 h-4" /> },
  { id: "skin", label: "Skin care", icon: <Leaf className="w-4 h-4" /> },
  { id: "andrologist", label: "Andrologist", icon: <User className="w-4 h-4" /> },
  { id: "gynecologist", label: "Gynecologist", icon: <Users className="w-4 h-4" /> },
];

const haversineKm = (aLat: number, aLon: number, bLat: number, bLon: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function assignCategory(tags: Record<string, string> | undefined, name: string): HospitalCategoryId {
  const n = (name || "").toLowerCase();
  const spec = (tags?.["healthcare:speciality"] || tags?.speciality || "").toLowerCase();

  if (spec.includes("pediatric") || spec.includes("paediatric") || /pediatric|paediatric|children\'?s?/.test(n))
    return "pediatric";
  if (spec.includes("ophthalmolog") || spec.includes("eye") || /eye|ophthal|vision/.test(n))
    return "eye";
  if (spec.includes("dermatolog") || spec.includes("skin") || /skin|dermatolog/.test(n))
    return "skin";
  if (spec.includes("urolog") || spec.includes("androlog") || /urolog|androlog|male\s*health/.test(n))
    return "andrologist";
  if (spec.includes("gynecolog") || spec.includes("gynaecolog") || spec.includes("obstetric") ||
      /gyn(aec)?o|obstetric|women\'?s?|maternity/.test(n))
    return "gynecologist";

  return "multicare";
}

async function fetchNearbyHealthcare(
  lat: number,
  lon: number,
  radiusMeters = 10000
): Promise<Hospital[]> {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      relation["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
      way["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="clinic"](around:${radiusMeters},${lat},${lon});
      way["healthcare"="clinic"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="centre"](around:${radiusMeters},${lat},${lon});
      way["healthcare"="centre"](around:${radiusMeters},${lat},${lon});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
    );
    out center 50;
  `;
  const url = `${OVERPASS_URL}?data=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
  const data = await res.json();
  const raw = Array.isArray(data?.elements) ? data.elements : [];
  const seen = new Set<string>();
  const mapped: Hospital[] = [];

  for (const el of raw) {
    const elLat = el.type === "node" ? el.lat : el.center?.lat;
    const elLon = el.type === "node" ? el.lon : el.center?.lon;
    if (typeof elLat !== "number" || typeof elLon !== "number") continue;
    const id = `${el.type}:${el.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const name = el.tags?.name || el.tags?.["name:en"] || "Hospital / Clinic";
    const category = assignCategory(el.tags, name);
    const distanceKm = haversineKm(lat, lon, elLat, elLon);
    mapped.push({ id, name, lat: elLat, lon: elLon, distanceKm, category });
  }

  mapped.sort((a, b) => a.distanceKm - b.distanceKm);
  const deduped: Hospital[] = [];
  const byKey = new Set<string>();
  for (const item of mapped) {
    const key = `${item.lat.toFixed(5)}_${item.lon.toFixed(5)}`;
    if (byKey.has(key)) continue;
    byKey.add(key);
    deduped.push(item);
    if (deduped.length >= 80) break;
  }
  return deduped;
}

function getDirectionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lon}`)}`;
}

function HospitalRow({ h }: { h: Hospital }) {
  const dist = h.distanceKm < 1 ? `${Math.round(h.distanceKm * 1000)} m` : `${h.distanceKm.toFixed(1)} km`;
  const directionsUrl = getDirectionsUrl(h.lat, h.lon);
  return (
    <li className="glass-panel border border-primary/20 p-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-display text-sm text-foreground truncate">{h.name}</p>
        <p className="text-xs text-muted-foreground">{dist} away</p>
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 px-3 py-1.5 rounded-lg font-display text-xs tracking-wider bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-all"
      >
        DIRECTIONS
      </a>
    </li>
  );
}

export default function NearbyHospitals() {
  const [status, setStatus] = useState<string>("");
  const [hospitalsByCategory, setHospitalsByCategory] = useState<Record<HospitalCategoryId, Hospital[]>>({
    pediatric: [],
    multicare: [],
    eye: [],
    skin: [],
    andrologist: [],
    gynecologist: [],
  });
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const [activeCategory, setActiveCategory] = useState<HospitalCategoryId>("multicare");

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersLayerRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  const ensureMap = (lat: number, lon: number): L.Map | null => {
    if (!mapRef.current) return null;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 13);
      if (userMarkerRef.current) userMarkerRef.current.setLatLng([lat, lon]);
      return mapInstanceRef.current;
    }
    const map = L.map(mapRef.current, { zoomControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    map.setView([lat, lon], 13);
    markersLayerRef.current = L.layerGroup().addTo(map);
    const primaryColor = "hsl(190, 100%, 50%)";
    userMarkerRef.current = L.circleMarker([lat, lon], {
      radius: 8,
      color: primaryColor,
      weight: 2,
      fillColor: primaryColor,
      fillOpacity: 0.25,
    })
      .addTo(map)
      .bindPopup("<b>You are here</b>");
    mapInstanceRef.current = map;
    return map;
  };

  const showHospitalsOnMap = (userLat: number, userLon: number, list: Hospital[]) => {
    const map = ensureMap(userLat, userLon);
    if (!map || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    const bounds = L.latLngBounds([[userLat, userLon]]);
    list.forEach((h) => {
      const marker = L.marker([h.lat, h.lon]).addTo(markersLayerRef.current!);
      const dist = h.distanceKm < 1 ? `${Math.round(h.distanceKm * 1000)} m` : `${h.distanceKm.toFixed(1)} km`;
      const safeName = (h.name || "Hospital").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const directionsUrl = getDirectionsUrl(h.lat, h.lon);
      const catLabel = HOSPITAL_CATEGORIES.find((c) => c.id === h.category)?.label || h.category;
      marker.bindPopup(
        `<b>${safeName}</b><br/><span style="font-size:11px;color:#666">${catLabel}</span><br/>${dist} away<br/><a href="${directionsUrl}" target="_blank" rel="noopener noreferrer">Directions</a>`
      );
      bounds.extend([h.lat, h.lon]);
    });
    if (list.length > 0) map.fitBounds(bounds.pad(0.2));
  };

  const allHospitals = Object.values(hospitalsByCategory).flat();

  const locateAndLoad = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported in this browser.");
      return;
    }
    setIsLocating(true);
    setStatus("Requesting location permission…");
    setHospitalsByCategory({
      pediatric: [],
      multicare: [],
      eye: [],
      skin: [],
      andrologist: [],
      gynecologist: [],
    });
    setUserCoords(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserCoords({ lat, lon });
          ensureMap(lat, lon);
          setStatus("Finding nearby hospitals and clinics by category…");
          const list = await fetchNearbyHealthcare(lat, lon, 10000);
          if (!list.length) {
            showHospitalsOnMap(lat, lon, []);
            setStatus("No hospitals or clinics found nearby. Try again later or a different area.");
            return;
          }
          const byCat: Record<HospitalCategoryId, Hospital[]> = {
            pediatric: [],
            multicare: [],
            eye: [],
            skin: [],
            andrologist: [],
            gynecologist: [],
          };
          list.forEach((h) => {
            if (byCat[h.category].length < 15) byCat[h.category].push(h);
          });
          setHospitalsByCategory(byCat);
          const toShow = list.slice(0, 50);
          showHospitalsOnMap(lat, lon, toShow);
          setStatus(`Found ${list.length} facilities. Shown by category below with directions.`);
        } catch (err) {
          console.error(err);
          setStatus("Could not load nearby hospitals. Please try again in a moment.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn(err);
        setIsLocating(false);
        if (err?.code === 1) {
          setStatus("Location permission denied. Allow location access and try again.");
        } else {
          setStatus("Could not get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    if (!userCoords || allHospitals.length === 0) return;
    const forCategory = hospitalsByCategory[activeCategory];
    if (forCategory.length > 0) {
      showHospitalsOnMap(userCoords.lat, userCoords.lon, forCategory);
    } else {
      showHospitalsOnMap(userCoords.lat, userCoords.lon, allHospitals.slice(0, 30));
    }
  }, [activeCategory, userCoords, hospitalsByCategory, allHospitals.length]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-primary/50" />
        <h2 className="font-display text-lg text-primary tracking-widest neon-text">
          NEARBY HOSPITALS
        </h2>
        <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-primary/50" />
      </div>

      <div className="glass-panel border border-primary/20 overflow-hidden p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button
            type="button"
            onClick={locateAndLoad}
            disabled={isLocating}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-display text-sm tracking-wider bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 hover:glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Navigation className="w-5 h-5 shrink-0" />
            {isLocating ? "LOCATING…" : "USE MY LOCATION"}
          </button>
          <p className="text-xs text-muted-foreground font-display tracking-wider flex-1">
            {status || "Find hospitals by category (pediatric, multi care, eye, skin, andrologist, gynecologist) with directions."}
          </p>
        </div>

        <div
          ref={mapRef}
          className="w-full h-64 rounded-xl overflow-hidden border border-primary/20 bg-muted/20 [&_.leaflet-container]:rounded-xl"
          style={{ minHeight: "16rem" }}
        />

        {allHospitals.length > 0 && (
          <>
            <p className="font-display text-xs tracking-wider text-primary/80 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              BY CATEGORY — TAP DIRECTIONS FOR GOOGLE MAPS
            </p>
            <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as HospitalCategoryId)} className="w-full">
              <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/30 border border-primary/20 p-1">
                {HOSPITAL_CATEGORIES.map((cat) => {
                  const count = hospitalsByCategory[cat.id].length;
                  return (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="flex items-center gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      {cat.icon}
                      <span className="hidden sm:inline">{cat.label}</span>
                      {count > 0 && <span className="text-[10px] opacity-80">({count})</span>}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {HOSPITAL_CATEGORIES.map((cat) => {
                const list = hospitalsByCategory[cat.id];
                return (
                  <TabsContent key={cat.id} value={cat.id} className="mt-3">
                    {list.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">
                        No facilities found in this category nearby. Try &quot;Multi care&quot; for general hospitals.
                      </p>
                    ) : (
                      <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {list.map((h) => (
                          <HospitalRow key={h.id} h={h} />
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
