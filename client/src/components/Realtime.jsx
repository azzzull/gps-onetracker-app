import {MapContainer, TileLayer, Marker, Popup, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {useEffect, useState, useRef, useMemo} from 'react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { carIcon, carIconInactive } from './carIcons';
import { useVehicleFilter } from './VehicleFilterContext';

// Fix untuk icon marker
delete L.Icon.Default.prototype._getIconUrl;
L
    .Icon
    .Default
    .mergeOptions({iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow});

// Tambahkan prop selectedPlates (array of string) ke Realtime
export default function Realtime({ vehicles: allVehicles = [] }) {
    const { selectedPlates, setSelectedPlates } = useVehicleFilter();
    const [vehicles, setVehicles] = useState([]);
    const [focusedVehicleId, setFocusedVehicleId] = useState(null); // ganti dari objek ke id
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [vehicleDetail, setVehicleDetail] = useState(null);
    const mapRef = useRef(null);
    const token = import.meta.env.VITE_API_TOKEN;

    // Format data kendaraan dari WebSocket
    const formatVehicleData = (data) => {
        return data.map(item => ({
            id: item.vehicle
                ?.id || item._id,
            lat: parseFloat(item.lat),
            long: parseFloat(item.long),
            temperature: item.container
                ?.temperature,
            location_name: item.location_name || "Lokasi tidak diketahui",
            time: item.time,
            number: item.vehicle
                ?.number,
            driver: item.vehicle
                ?.driver
        }));
    };

    // WebSocket connection
    useEffect(() => {
    const fetchInitialVehicles = async () => {
        try {
            const res = await fetch('http://localhost:5000/vehicle', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            const formatted = formatVehicleData(data);
            setVehicles(formatted);
        } catch (err) {
            console.error('Failed to fetch initial vehicles:', err);
        }
    };

    const socket = new WebSocket('ws://localhost:5001');

    socket.onopen = () => {
        console.log('WebSocket connected to proxy');
        setConnectionStatus('connected');
        fetchInitialVehicles();
    };

    socket.onmessage = async (e) => {
        try {
            const rawData = e.data instanceof Blob ? await e.data.text() : e.data;
            const vehiclesData = JSON.parse(rawData);

            if (Array.isArray(vehiclesData)) {
                const formatted = formatVehicleData(vehiclesData);
                setVehicles(formatted);
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    };

        socket.onerror = (e) => {
            console.error('WebSocket error:', e);
            setConnectionStatus('error');
        };

        socket.onclose = (e) => {
            console.log(`WebSocket closed: ${e.code}`);
            setConnectionStatus('disconnected');
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [token]);

    const plates = Array.from(new Set(vehicles.map((v) => v.id)));

    // Tambahkan logika status aktif/inaktif berdasarkan data waktu terakhir
    const now = useMemo(() => Date.now(), []);
    const vehiclesWithStatus = useMemo(() => {
        return vehicles.map(v => {
            // Jika tidak ada waktu, anggap aktif
            if (!v.time) return { ...v, status: 'active' };
            const lastTime = new Date(v.time).getTime();
            const diff = (now - lastTime) / (1000 * 60 * 60); // jam
            if (diff > 1) return { ...v, status: 'inactive' };
            return { ...v, status: 'active' };
        });
    }, [vehicles, now]);

    // Filter kendaraan berdasarkan plates yang dipilih
    const filteredVehicles =
        selectedPlates.length === 0 || (selectedPlates.length === 1 && selectedPlates[0] === 'all')
            ? vehiclesWithStatus // jika tidak ada yang dipilih atau 'all', tampilkan semua
            : vehiclesWithStatus.filter(v => selectedPlates.includes(v.id));

    // Filter koordinat yang valid
    const validVehicles = filteredVehicles.filter(v => !isNaN(v.lat) && !isNaN(v.long) && v.id);

    const markerRefs = useRef({});

    // Fungsi untuk membuka popup
    const openPopup = (vehicleId) => {
        if (markerRefs.current[vehicleId]) {
            markerRefs
                .current[vehicleId]
                .openPopup();
        }
    };

    // Fungsi untuk membuka semua popup
    const openAllPopups = () => {
        validVehicles.forEach(vehicle => {
            openPopup(vehicle.id);
        });
    };

    // Buka semua popup saat data berubah
    useEffect(() => {
        const timer = setTimeout(() => {
            openAllPopups();
        }, 1000); // Beri sedikit delay untuk memastikan marker sudah ter-render

        return () => clearTimeout(timer);
    }, [validVehicles]);

    // Fetch detail kendaraan by id
    const fetchVehicleDetail = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/vehicle/${id}`);
            if (!res.ok) throw new Error('Gagal fetch detail kendaraan');
            const data = await res.json();
            setVehicleDetail(data);
        } catch (err) {
            setVehicleDetail(null);
        }
    };

    // Dapatkan objek vehicle yang difokuskan dari id
    const focusedVehicle = useMemo(() => {
        if (!focusedVehicleId) return null;
        return vehicles.find(v => v.id === focusedVehicleId) || null;
    }, [focusedVehicleId, vehicles]);

    // Saat marker di-klik, set id kendaraan yang difokuskan
    const handleMarkerClick = (vehicle) => {
        setFocusedVehicleId(vehicle.id);
        const detail = vehicles.find(v => v.id === vehicle.id);
        setVehicleDetail(detail || null);
    };

    // MapController versi simple: auto-center/flyTo setiap data/focus berubah, tanpa hasUserInteracted/triggerFit
    function MapController({ focus, allVehicles }) {
        const map = useMap();
        const prevKey = useRef('');
        useEffect(() => {
            // Buat key unik dari focus.id atau markerKey
            let key = '';
            if (focus && typeof focus.lat === 'number' && typeof focus.long === 'number') {
                key = 'focus:' + focus.id;
            } else if (!focus && allVehicles.length > 0) {
                key = 'bounds:' + allVehicles.map(v => v.id).join(',');
            }
            // Hanya update map jika key berubah
            if (prevKey.current !== key) {
                if (focus && typeof focus.lat === 'number' && typeof focus.long === 'number') {
                    map.flyTo([focus.lat, focus.long], 16, { duration: 1 });
                } else if (!focus && allVehicles.length > 0) {
                    const boundsArr = allVehicles
                        .filter((v) => typeof v.lat === 'number' && !isNaN(v.lat) && typeof v.long === 'number' && !isNaN(v.long))
                        .map((v) => [v.lat, v.long]);
                    if (boundsArr.length > 0) {
                        map.fitBounds(boundsArr, { padding: [60, 60], duration: 0.7 });
                    }
                }
                prevKey.current = key;
            }
        }, [focus, allVehicles, map]);
        return null;
    }

    return (
        <div className="w-full h-full bg-slate-100 p-3 relative">
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-lg">
                <MapContainer
                    center={[-6.2, 106.8]}
                    zoom={13}
                    className="w-full h-full z-10"
                    whenCreated={mapInstance => {
                        mapRef.current = mapInstance;
                        setHasUserInteracted(false); // reset saat map dibuat ulang
                    }}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                    <MapController
                        focus={validVehicles.find(v => v.id === focusedVehicleId)}
                        allVehicles={validVehicles}
                    />

                    {validVehicles.map((vehicle) => (
                        <Marker
                            key={vehicle.id}
                            position={[vehicle.lat, vehicle.long]}
                            icon={vehicle.status === 'inactive' ? carIconInactive : carIcon}
                            ref={(ref) => {
                                if (ref) {
                                markerRefs.current[vehicle.id] = ref;
                                setTimeout(() => ref.openPopup(), 100);
                                }
                            }}
                            eventHandlers={{
                                click: () => handleMarkerClick(vehicle)
                            }}
                            >
                            <Popup 
                                autoClose={false}
                                closeOnClick={false}
                                closeButton={false}
                                className="persistent-popup"
                            >
                                <div className='text-[10px] p-1 leading-[0.2] text-zinc-800'>
                                    <p className="mb-0 pb-0"><strong>ID : </strong>{vehicle.id}</p>
                                    <p className="mb-0 pb-0"><strong>Status : </strong>{vehicle.status === 'inactive' ? 'Inactive (>1 jam)' : 'Active'}</p>
                                    <p className="mb-0 pb-0"><strong>Suhu : </strong>{vehicle.temperature ?? '-'}°C</p>
                                </div>
                            </Popup>
                            </Marker>
                    ))}
                </MapContainer>
            </div>

            {focusedVehicle && (
                <div
                    className="absolute bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-110 z-[999] px-7">
                    <button
                        onClick={() => { setFocusedVehicleId(null); setVehicleDetail(null); }}
                        className="absolute top-1 right-2 text-gray-500 hover:text-red-600 cursor-pointer">
                        ✖
                    </button>
                    <h2 className="text-lg font-bold mb-2">Detail Kendaraan</h2>
                    <p>
                        <strong>🚚 Plat : </strong>
                        {vehicleDetail?.plate || vehicleDetail?.number || '-'}</p>
                    <p>
                        <strong>🧑‍✈️ Driver : </strong>
                        {vehicleDetail?.driver?.name || vehicleDetail?.driverName || vehicleDetail?.driver || '-'}</p>
                    <p>
                        <strong>🌡️ Suhu : </strong>
                        {focusedVehicle.temperature ?? '-'}°C</p>
                    <p>
                        <strong>📍 Lokasi : </strong>
                        {focusedVehicle.location_name}</p>
                    <p>
                        <strong>🕒 Waktu : </strong>
                        {new Date(focusedVehicle.time).toLocaleString()}</p>
                </div>
            )}

            <div className="absolute top-4 right-4 flex items-center gap-2 z-[1000]">
                <div className="bg-white/90 px-3 py-1 rounded-full text-xs shadow">
                    Status: {connectionStatus === 'connected'
                        ? '🟢 Terhubung'
                        : connectionStatus === 'connecting'
                            ? '🟡 Menghubungkan...'
                            : '🔴 Terputus'}
                </div>
            </div>
        </div>
    );
}