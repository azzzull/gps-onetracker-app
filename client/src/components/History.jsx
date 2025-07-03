import { useEffect, useState } from 'react';

const qtyPerPage = 20;
const BEARER_TOKEN = 'wtv4iBavjfCY92DbxTCsUVDRGAAhuG9QK4Y7HoscIJRDwHzLPIWkwvQqcQ4JqlOv';

export default function HistoryLog() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState('');
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('http://localhost:5000/vehicle', {
          headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setVehicles(data);
      } catch (err) {
        console.error('❌ Gagal ambil vehicle:', err);
        setError('Gagal memuat daftar kendaraan');
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (!selectedVehicleId) {
      setVehicleInfo(null);
      return;
    }

    const fetchVehicleInfo = async () => {
      try {
        const params = new URLSearchParams({ id: selectedVehicleId });
        const res = await fetch(`http://localhost:5000/vehicle?${params.toString()}`, {
          headers: { 
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setVehicleInfo(data);
        setError(null);
      } catch (err) {
        console.error('❌ Gagal ambil info kendaraan:', err);
        setVehicleInfo(null);
        setError('Gagal memuat info kendaraan');
      }
    };
    
    fetchVehicleInfo();
  }, [selectedVehicleId]);

  useEffect(() => {
    if (!selectedVehicleId) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // Format date range for API
        let dateFilter = {};
        if (date) {
          const startDate = new Date(date);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);
          
          dateFilter = {
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString()
          };
        }

        const params = new URLSearchParams({
          id: selectedVehicleId,
          start: page * qtyPerPage,
          qty: qtyPerPage,
          ...dateFilter
        });

        const res = await fetch(`http://localhost:5000/data?${params.toString()}`, {
          headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
        });

        if (!res.ok) throw new Error(`Gagal memuat data: ${res.status}`);
        
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setLogs([]);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [selectedVehicleId, page, date]);

  const clearDateFilter = () => {
    setDate('');
    setPage(0);
  };

  // Filter logs client-side as fallback (if API doesn't support date filtering)
  const filteredLogs = date 
    ? logs.filter(log => {
        const logDate = new Date(log.time).toISOString().split('T')[0];
        const selectedDate = new Date(date).toISOString().split('T')[0];
        return logDate === selectedDate;
      })
    : logs;

  return (
    <div className="w-full h-full bg-slate-100 p-3 relative">
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-lg p-10 bg-white">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Kendaraan</label>
            <select
              className="w-full border px-3 py-2 rounded-md"
              value={selectedVehicleId}
              onChange={(e) => {
                setSelectedVehicleId(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Pilih Kendaraan</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.number || v.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 border px-3 py-2 rounded-md"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setPage(0);
                }}
              />
              {date && (
                <button
                  onClick={clearDateFilter}
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {vehicleInfo && (
          <div className="mb-6 bg-white rounded-md shadow-md p-4 border">
            <h3 className="text-lg font-semibold mb-2">Informasi Kendaraan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <p><strong>Nomor : </strong> {vehicleInfo.number || '-'}</p>
              <p><strong>Pengemudi : </strong> {vehicleInfo.driver || '-'}</p>
              <p><strong>Tipe : </strong> {vehicleInfo.type || '-'}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mb-4 p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">Memuat data...</p>
          </div>
        )}

        <div className="bg-white rounded-md shadow-md border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-200">
              <tr>
                <th className="px-4 py-2 text-left">Waktu</th>
                <th className="px-4 py-2 text-left">Lokasi</th>
                <th className="px-4 py-2 text-left">Koordinat</th>
                <th className="px-4 py-2 text-left">Suhu</th>
                <th className="px-4 py-2 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(log.time).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{log.location_name || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {log.lat && log.long ? `${log.lat}, ${log.long}` : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {log.container?.temperature ? `${log.container.temperature}°C` : '-'}
                    </td>
                    <td className="px-4 py-2">{log.remarks || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                    {selectedVehicleId 
                      ? isLoading ? 'Memuat...' : `Tidak ada data log${date ? ' untuk tanggal ini' : ''}` 
                      : 'Pilih kendaraan terlebih dahulu'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredLogs.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50"
              disabled={page === 0 || isLoading}
            >
              ⬅ Sebelumnya
            </button>
            <span className="text-sm">Halaman {page + 1}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50"
              disabled={filteredLogs.length < qtyPerPage || isLoading}
            >
              Selanjutnya ➡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}