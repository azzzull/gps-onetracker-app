// Fetch all vehicles for MapView and History
export async function fetchAllVehicles() {
  const BEARER_TOKEN = 'wtv4iBavjfCY92DbxTCsUVDRGAAhuG9QK4Y7HoscIJRDwHzLPIWkwvQqcQ4JqlOv';
  const res = await fetch('http://localhost:5000/vehicle', {
    headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
  });
  if (!res.ok) throw new Error('Gagal fetch kendaraan');
  const data = await res.json();
  // Normalisasi agar setiap kendaraan punya id dan plate
  return data.map(v => ({
    id: v._id || v.id || v.plate || v.number, // fallback ke plate jika tidak ada id
    plate: v.plate || v.number || v.id || v._id,
    ...v
  }));
}
