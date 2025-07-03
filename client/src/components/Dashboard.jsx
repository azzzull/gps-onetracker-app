import { Truck, AlertTriangle, MapPinCheckInside, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCountUp } from './useCountUp';

export default function Dashboard() {
    const [activeVehicle, setActiveVehicle] = useState(0);
    const [totalVehicle, setTotalVehicle] = useState(0);
    const [totalRoutes, setTotalRoutes] = useState(0);
    const [pendingAlerts, setPendingAlerts] = useState('-');
    const [alertVehicles, setAlertVehicles] = useState([]);
    const [showAlertModal, setShowAlertModal] = useState(false);

    const animatedActive = useCountUp(activeVehicle);
    const animatedTotal = useCountUp(totalVehicle);
    const animatedRoutes = useCountUp(totalRoutes);
    const animatedAlerts = useCountUp(typeof pendingAlerts === 'number' ? pendingAlerts : 0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch vehicles
                const resVehicle = await fetch('http://localhost:5000/vehicle');
                const vehicles = await resVehicle.json();
                setTotalVehicle(vehicles.length);

                // Hitung active vehicle berdasarkan waktu update terakhir dari data posisi
                const now = Date.now();
                let activeCount = 0;
                let total = 0;
                let alerts = [];
                await Promise.all(vehicles.map(async (v) => {
                    try {
                        // Ambil data posisi terakhir
                        const res = await fetch(`http://localhost:5000/data?id=${v.id}&limit=1`);
                        const data = await res.json();
                        if (Array.isArray(data) && data.length > 0) {
                            const last = data[0];
                            const temp = last.container && last.container.temperature !== undefined ? parseFloat(last.container.temperature) : undefined;
                            if (temp !== undefined && temp > 15) {
                                // Fetch detail kendaraan untuk plat, driver, dsb
                                let plate = v.plate || v.number || '-';
                                let driver = v.driver?.name || v.driverName || v.driver || '-';
                                let location = last.location_name || '-';
                                try {
                                    const resDetail = await fetch(`http://localhost:5000/vehicle/${v.id}`);
                                    if (resDetail.ok) {
                                        const detail = await resDetail.json();
                                        plate = detail.plate || detail.number || plate;
                                        driver = detail.driver?.name || detail.driverName || detail.driver || driver;
                                        if (detail.location_name) location = detail.location_name;
                                    }
                                } catch {}
                                alerts.push({
                                    id: v.id,
                                    plate,
                                    driver,
                                    temperature: temp,
                                    location,
                                    time: last.time
                                });
                            }
                        }
                    } catch {}
                }));
                setActiveVehicle(activeCount);
                setAlertVehicles(alerts);
                setPendingAlerts(alerts.length > 0 ? alerts.length : '-');

                // Fetch total routes dari semua kendaraan
                // (sudah diakumulasi di atas jika pakai limit=1, jadi fetch ulang jika ingin total semua)
                let totalRoutes = 0;
                for (const v of vehicles) {
                    try {
                        const res = await fetch(`http://localhost:5000/data?id=${v.id}`);
                        const data = await res.json();
                        if (Array.isArray(data)) totalRoutes += data.length;
                    } catch {}
                }
                setTotalRoutes(totalRoutes);
            } catch (err) {
                setActiveVehicle(0);
                setTotalVehicle(0);
                setTotalRoutes(0);
                setPendingAlerts('-');
            }
        };
        fetchData();
    }, []);

    return (
        <div className="w-full h-full bg-slate-100 p-3">
            <div className="bg-white rounded-3xl p-8 shadow-md w-full h-full">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="card">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                            <Navigation className="w-6 h-6" />
                            Active Vehicle
                        </h2>
                        <p className="text-5xl font-extrabold text-sky-600 mt-2">{animatedActive}</p>
                    </div>

                    {/* Card 2 */}
                    <div className="card">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                            <Truck className="w-6 h-6" />
                            Total Vehicles
                        </h2>
                        <p className="text-5xl font-extrabold text-emerald-600 mt-2">{animatedTotal}</p>
                    </div>

                    {/* Card 3 */}
                    <div className="card">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                            <MapPinCheckInside className="w-6 h-6" />
                            Total Routes
                        </h2>
                        <p className="text-5xl font-extrabold text-indigo-600 mt-2">{animatedRoutes}</p>
                    </div>

                    {/* Card 4 */}
                    <div className="card relative">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                            <AlertTriangle className="w-6 h-6" />
                            Alerts
                        </h2>
                        <p className="text-5xl font-extrabold text-rose-600 mt-2">{animatedAlerts}</p>
                        {alertVehicles.length > 0 && (
                            <button
                                className="mt-3 text-rose-600 font-semibold hover:text-rose-900 transition bg-transparent border-none shadow-none px-0 py-0 rounded-none cursor-pointer focus:outline-none"
                                style={{ boxShadow: 'none', background: 'none', textDecoration: 'none' }}
                                onClick={() => setShowAlertModal(true)}
                            >
                                Lihat Kendaraan {'>>'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* Modal Alert Vehicles */}
            {showAlertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px] bg-black/10">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative animate-modalPop">
                        <button
                            className="absolute top-2 right-2 text-slate-500 hover:text-rose-800 cursor-pointer text-xl font-bold"
                            onClick={() => setShowAlertModal(false)}
                            aria-label="Tutup"
                        >
                            ×
                        </button>
                        <div className="flex items-center gap-2 mb-4 text-rose-700 font-bold text-lg">
                            <AlertTriangle className="w-5 h-5" />
                            Kendaraan dengan suhu {'>'} 15°C
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-700">
                                        <th className="pr-4 py-1">ID</th>
                                        <th className="pr-4 py-1">Plat</th>
                                        <th className="pr-4 py-1">Driver</th>
                                        <th className="pr-4 py-1">Suhu (°C)</th>
                                        <th className="pr-4 py-1">Lokasi</th>
                                        <th className="pr-4 py-1">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alertVehicles.map((v, i) => (
                                        <tr key={i} className="text-rose-800">
                                            <td className="pr-4 py-1 font-mono">{v.id}</td>
                                            <td className="pr-4 py-1">{v.plate}</td>
                                            <td className="pr-4 py-1">{v.driver}</td>
                                            <td className="pr-4 py-1">{v.temperature.toFixed(1)}</td>
                                            <td className="pr-4 py-1">{v.location}</td>
                                            <td className="pr-4 py-1">{new Date(v.time).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Tambahkan animasi modal di global css/tailwind: */
/*
@keyframes modalPop {
  0% { opacity: 0; transform: scale(0.95) translateY(30px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-modalPop {
  animation: modalPop 0.25s cubic-bezier(0.4,0,0.2,1);
}
*/
