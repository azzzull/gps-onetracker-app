import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useVehicleFilter } from './VehicleFilterContext';

// Custom truck icon, fallback ke default jika gagal load
let carIcon;
try {
  carIcon = new L.Icon({
    iconUrl: '/icons/location.svg',
    iconSize: [30, 30],
    iconAnchor: [16, 16],
    popupAnchor: [0, 0],
  });
} catch (e) {
  carIcon = new L.Icon.Default();
}

const BEARER_TOKEN = 'wtv4iBavjfCY92DbxTCsUVDRGAAhuG9QK4Y7HoscIJRDwHzLPIWkwvQqcQ4JqlOv';

export default function MapView({ vehicles = [], selectedDate }) {
  const { selectedPlates } = useVehicleFilter();
  const selectedPlate = selectedPlates[0] || 'all';
  const [history, setHistory] = useState([]);
  const [iconError, setIconError] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState({});
  const [popupLoading, setPopupLoading] = useState({});
  const PAGE_SIZE = 1000;

  // Gabungkan reset state dan fetch data history dalam satu useEffect
  useEffect(() => {
    // Reset state saat filter berubah
    setHistory([]);
    setLoading(true);
    setPage(0); // reset ke halaman pertama jika filter berubah

    // Jika semua kendaraan, fetch tanpa id
    let fetchAll = selectedPlate === 'all';
    if (!selectedPlate) {
      setHistory([]);
      setLoading(false);
      return;
    }
    // Cari ID kendaraan dari plat nomor
    let vehicleId = selectedPlate;
    if (!fetchAll && vehicles && vehicles.length > 0) {
      const found = vehicles.find(v => v.number === selectedPlate || v.plate === selectedPlate);
      if (found) vehicleId = found.id;
    }
    if (!fetchAll && !vehicleId) {
      setHistory([]);
      setLoading(false);
      return;
    }
    // Build params
    const params = new URLSearchParams();
    if (!fetchAll) params.append('id', vehicleId);
    params.append('start', page * PAGE_SIZE);
    params.append('qty', PAGE_SIZE);
    if (selectedDate) {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      params.append('start_time', startDate.toISOString());
      params.append('end_time', endDate.toISOString());
    }
    const url = `http://localhost:5000/data?${params.toString()}`;
    console.log('FETCH URL:', url);
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
        });
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlate, selectedDate, vehicles, page]);

  // Debug: log data history
  useEffect(() => {
    console.log('History data:', history);
  }, [history]);

  // Filter agar hanya satu data per kendaraan per 1 menit
  function filterPer1Minute(data) {
    const grouped = {};
    data.forEach(item => {
      const t = new Date(item.timestamp || item.time);
      if (isNaN(t)) return;
      // Bulatkan ke bawah ke 1 menit terdekat
      t.setSeconds(0, 0);
      // t.setMinutes(Math.floor(t.getMinutes() / 1) * 1); // tidak perlu, sudah per menit
      const key = `${item.plate || item.vehicleId || item.id || '-'}-${t.toISOString()}`;
      // Simpan hanya satu log per kendaraan per slot 1 menit (ambil yang pertama ditemukan)
      if (!grouped[key]) grouped[key] = item;
    });
    return Object.values(grouped);
  }

  // Urutkan data dari yang terbaru ke terlama
  const filteredHistory = (selectedDate
    ? filterPer1Minute(history.filter(item => {
        const t = item.timestamp || item.time;
        if (!t) return false;
        const logDate = new Date(t).toISOString().split('T')[0];
        return logDate === selectedDate;
      }))
    : filterPer1Minute(history)
  ).sort((a, b) => {
    const ta = new Date(a.timestamp || a.time).getTime();
    const tb = new Date(b.timestamp || b.time).getTime();
    return tb - ta; // terbaru duluan
  });

  // Untuk mode 'all', batasi marker maksimal 1000 terbaru agar tetap ringan
  let limitedHistory = filteredHistory;
  let showAllWarning = false;
  if (selectedPlate === 'all' && filteredHistory.length > 1000) {
    limitedHistory = filteredHistory.slice(0, 1000);
    showAllWarning = true;
  }

  // Utilitas untuk ambil detail kendaraan dari berbagai sumber
  function getVehicleDetail({ id, item, vehicleDetails, vehicles }) {
    // 1. Cek cache detail
    if (vehicleDetails[id]) return vehicleDetails[id];
    // 2. Cek di vehicles prop
    let found = vehicles.find(v =>
      v.id === id ||
      v.vehicleId === id ||
      v.plate === id ||
      v.number === id ||
      v.plate === item.plate ||
      v.number === item.plate
    );
    if (found) return found;
    // 3. Cek di item perjalanan
    return item || {};
  }

  const handlePopupOpen = async (id, item) => {
    if (!id || vehicleDetails[id]) return;
    setPopupLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`http://localhost:5000/vehicle/${id}`);
      if (res.ok) {
        const data = await res.json();
        setVehicleDetails((prev) => ({ ...prev, [id]: data }));
      } else {
        // Jika gagal fetch, fallback ke vehicles prop
        const fallback = vehicles.find(v =>
          v.id === id ||
          v.vehicleId === id ||
          v.plate === id ||
          v.number === id ||
          v.plate === item.plate ||
          v.number === item.plate
        );
        if (fallback) {
          setVehicleDetails((prev) => ({ ...prev, [id]: fallback }));
        }
      }
    } catch {
      // Fallback jika error
      const fallback = vehicles.find(v =>
        v.id === id ||
        v.vehicleId === id ||
        v.plate === id ||
        v.number === id ||
        v.plate === item.plate ||
        v.number === item.plate
      );
      if (fallback) {
        setVehicleDetails((prev) => ({ ...prev, [id]: fallback }));
      }
    }
    setPopupLoading((prev) => ({ ...prev, [id]: false }));
  };

  const markers = limitedHistory
    .filter(item => {
      // Pastikan lat/long bisa diparse ke number
      const lat = Number(item.lat);
      const long = Number(item.long);
      return !isNaN(lat) && !isNaN(long);
    })
    .map((item, idx) => {
      // Buat key unik: prioritaskan _id, id, lalu gabungan plate/vehicleId + timestamp/time
      const key =
        item._id ||
        item.id ||
        `${item.plate || item.vehicleId || 'unknown'}-${item.timestamp || item.time || idx}`;
      const id = item.vehicleId || item.id || item.plate || item.number;
      const detail = getVehicleDetail({ id, item, vehicleDetails, vehicles });
      const loading = popupLoading[id];
      // Fallback plat & driver dari semua kemungkinan property
      const plate = detail.plate || detail.number || item.plate || item.number || '-';
      const driver = (
        detail.driver?.name ||
        detail.driverName ||
        detail.driver ||
        item.driverName ||
        item.driver ||
        (detail.driver && typeof detail.driver === 'string' ? detail.driver : undefined) ||
        '-'
      );
      return (
        <Marker
          key={key}
          position={[Number(item.lat), Number(item.long)]}
          icon={iconError ? new L.Icon.Default() : carIcon}
          eventHandlers={{
            error: () => setIconError(true),
            popupopen: () => handlePopupOpen(id, item),
          }}
        >
          <Popup>
            <div className="text-xs text-zinc-800 leading-tight min-w-[180px]">
              {loading ? (
                <div className="text-gray-400 italic">Memuat detail kendaraan...</div>
              ) : (
                <>
                  <div><strong>🚚 Plat:</strong> {plate}</div>
                  <div><strong>🧑‍✈️ Driver:</strong> {driver}</div>
                  <div><strong>📍 Lokasi:</strong> {item.location_name || '-'}</div>
                  <div><strong>🕒 Waktu:</strong> {item.timestamp || item.time ? new Date(item.timestamp || item.time).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) : '-'}</div>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      );
    });

  return (
    <div className="w-full h-full bg-slate-100 p-3 relative">
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-lg flex flex-col relative">
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading data...</div>
          ) : (
            <MapContainer
              center={[-6.2, 106.8]}
              zoom={13}
              className="w-full h-full z-10"
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {markers.length === 0 && <></>}
              {markers}
            </MapContainer>
          )}
        </div>
        {filteredHistory.length === PAGE_SIZE && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow text-xs z-[1001]">
            Data terlalu banyak, hanya {PAGE_SIZE} data per halaman. Gunakan tombol Next untuk melihat data berikutnya.
          </div>
        )}
        {showAllWarning && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow text-xs z-[1001]">
            Data terlalu banyak untuk mode "Semua Kendaraan". Hanya 1000 marker terbaru yang ditampilkan. Silakan filter per kendaraan untuk detail lebih lengkap.
          </div>
        )}
      </div>
    </div>
  );
}
