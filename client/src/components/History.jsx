import { useEffect, useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../datepicker.css";
import { selectStyles } from './selectStyles';

const qtyPerPage = 20;
const PAGE_SIZE_FILTER = 20;
const BEARER_TOKEN = 'wtv4iBavjfCY92DbxTCsUVDRGAAhuG9QK4Y7HoscIJRDwHzLPIWkwvQqcQ4JqlOv';

export default function HistoryLog({ vehicles }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(null);
  const [page, setPage] = useState(0);
  const [filterPage, setFilterPage] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // all | normal | not_normal

  const statusOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'normal', label: 'Suhu Normal (≤ 20°C)' },
    { value: 'not_normal', label: 'Suhu Tidak Normal (> 20°C)' }
  ];


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
        // Jika ada filter tanggal, fetch dengan qty besar agar data tanggal itu pasti terambil
        const params = new URLSearchParams({
          id: selectedVehicleId,
          start: 0,
          qty: date ? 1000 : qtyPerPage
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

  // Reset page filter saat tanggal berubah
  useEffect(() => {
    setFilterPage(0);
  }, [date]);

  const clearDateFilter = () => {
    setDate(null);
    setPage(0);
  };

  // Filter logs client-side as fallback (if API doesn't support date filtering)
  const filteredLogs = (date
    ? logs.filter(log => {
        if (typeof log.time !== 'string') return false;
        const logDate = new Date(log.time);
        // Bandingkan hanya tanggal, bulan, dan tahun
        return logDate.getFullYear() === date.getFullYear() &&
               logDate.getMonth() === date.getMonth() &&
               logDate.getDate() === date.getDate();
      })
    : logs
  ).filter(log => {
    if (statusFilter === 'all') return true;
    if (log.container?.temperature !== undefined && log.container?.temperature !== null) {
      if (statusFilter === 'normal') return log.container.temperature <= 20;
      if (statusFilter === 'not_normal') return log.container.temperature > 20;
    }
    // Jika tidak ada data suhu, hanya tampilkan di 'all'
    return statusFilter === 'all';
  });

  // Pagination frontend untuk hasil filter tanggal
  const pagedLogs = date
    ? filteredLogs.slice(filterPage * PAGE_SIZE_FILTER, (filterPage + 1) * PAGE_SIZE_FILTER)
    : filteredLogs;

  return (
    <div className="w-full min-h-full bg-slate-100 p-3 relative">
      <div className="w-full min-h-full rounded-3xl shadow-lg p-10 bg-white">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Kendaraan</label>
            <Select
              options={vehicles.map(v => ({ value: v.id, label: v.id }))}
              value={vehicles.find(v => v.id === selectedVehicleId) ? { value: selectedVehicleId, label: selectedVehicleId } : null}
              onChange={opt => {
                setSelectedVehicleId(opt ? opt.value : '');
                setPage(0);
              }}
              isClearable
              placeholder="Pilih atau cari kendaraan..."
              classNamePrefix="react-select"
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              styles={selectStyles}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Tanggal</label>
                <DatePicker
                  selected={date}
                  onChange={(date) => {
                    setDate(date);
                    setPage(0);
                  }}
                  dateFormat="dd-MM-yyyy"
                  wrapperClassName="w-full" // ini untuk wrapper agar mengikuti flex-1
                  className="w-full border px-3 py-2 rounded-md" // ini untuk input-nya agar lebar penuh juga
                  placeholderText="Pilih tanggal"
                  isClearable
                />
            </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Status Suhu</label>
            <Select
              options={statusOptions}
              value={statusOptions.find(opt => opt.value === statusFilter)}
              onChange={opt => {
                setStatusFilter(opt.value);
                setPage(0);
                setFilterPage(0);
              }}
              classNamePrefix="react-select"
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              styles={selectStyles}
            />
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-800"></div>
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
              {pagedLogs.length > 0 ? (
                pagedLogs.map((log, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {/* Format dd-MM-yyyy HH.mm.ss */}
                      {log.time
                        ? (() => {
                            const d = new Date(log.time);
                            const dd = String(d.getDate()).padStart(2, '0');
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const yyyy = d.getFullYear();
                            const HH = String(d.getHours()).padStart(2, '0');
                            const min = String(d.getMinutes()).padStart(2, '0');
                            const ss = String(d.getSeconds()).padStart(2, '0');
                            return `${dd}-${mm}-${yyyy} ${HH}.${min}.${ss}`;
                          })()
                        : '-'}
                    </td>
                    <td className="px-4 py-2">{log.location_name || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {log.lat && log.long ? `${log.lat}, ${log.long}` : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {log.container?.temperature ? `${log.container.temperature}°C` : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {log.container?.temperature !== undefined && log.container?.temperature !== null ? (
                        log.container.temperature > 20 ? (
                          <span className="text-orange-500 font-semibold">Suhu Tidak Normal</span>
                        ) : (
                          <span className="text-green-600 font-semibold">Suhu Normal</span>
                        )
                      ) : (
                        log.remarks || '-'
                      )}
                    </td>
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
              onClick={() => date ? setFilterPage((prev) => Math.max(prev - 1, 0)) : setPage((prev) => Math.max(prev - 1, 0))}
              className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50"
              disabled={date ? filterPage === 0 : page === 0 || isLoading}
            >
              ⬅ Sebelumnya
            </button>
            <span className="text-sm">Halaman {date ? filterPage + 1 : page + 1}</span>
            <button
              onClick={() => date ? setFilterPage((prev) => prev + 1) : setPage((prev) => prev + 1)}
              className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50"
              disabled={date ? pagedLogs.length < PAGE_SIZE_FILTER : filteredLogs.length < qtyPerPage || isLoading}
            >
              Selanjutnya ➡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}