import { useEffect, useState } from 'react';

export default function Admin({ vehicles, refreshData }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState(null);

    const handleEdit = (vehicle) => {
        setIsEditing(true);
        setCurrentVehicle(vehicle);
    };

    const handleDelete = (id) => {
        fetch(`http://localhost:5000/vehicle?id=${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    refreshData();
                } else {
                    console.error('Failed to delete vehicle');
                }
            });
    };

    const handleSave = (e) => {
        e.preventDefault();
        const url = isEditing ? `http://localhost:5000/vehicle?id=${currentVehicle.id}` : 'http://localhost:5000/vehicle';
        const method = isEditing ? 'PUT' : 'POST';

        const payload = { ...currentVehicle };
        // Ensure driver is a string
        payload.driver = payload.driver?.name || payload.driverName || payload.driver || '';
        delete payload.driverName; // Clean up extra fields if they exist

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) {
                    // Log the error response from the server for better debugging
                    return res.json().then(err => { throw new Error(JSON.stringify(err)) });
                }
                return res.json();
            })
            .then(() => {
                refreshData();
                setIsEditing(false);
                setCurrentVehicle(null);
            })
            .catch(error => {
                console.error('Error saving vehicle:', error.message);
                // Optionally, show an error message to the user
            });
    };

    return (
        <div className="w-full min-h-full bg-slate-100 p-3">
            <div className="bg-white rounded-3xl p-8 shadow-md w-full min-h-full">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Panel</h1>

                {isEditing || currentVehicle ? (
                    <form onSubmit={handleSave} className="mb-8 p-4 border rounded">
                        <h2 className="text-xl mb-4">{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
                        <input
                            type="text"
                            placeholder="ID"
                            value={currentVehicle?.id || ''}
                            onChange={(e) => setCurrentVehicle({ ...currentVehicle, id: e.target.value })}
                            className="border p-2 mb-2 w-full"
                            required
                            disabled={isEditing}
                        />
                        <input
                            type="text"
                            placeholder="Number"
                            value={currentVehicle?.number || ''}
                            onChange={(e) => setCurrentVehicle({ ...currentVehicle, number: e.target.value })}
                            className="border p-2 mb-2 w-full"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Driver Name"
                            value={currentVehicle?.driver?.name || currentVehicle?.driverName || currentVehicle?.driver || ''}
                            onChange={(e) => {
                                const newDriver = e.target.value;
                                // When updating, we just need the name as a string for the payload
                                // but we can keep the state simple
                                setCurrentVehicle(prevState => ({
                                    ...prevState,
                                    driver: newDriver,
                                    driverName: newDriver // also update driverName for consistency if needed
                                }));
                            }}
                            className="border p-2 mb-2 w-full"
                        />
                        <input
                            type="text"
                            placeholder="Type"
                            value={currentVehicle?.type || ''}
                            onChange={(e) => setCurrentVehicle({ ...currentVehicle, type: e.target.value })}
                            className="border p-2 mb-4 w-full"
                        />
                        <button type="submit" className="bg-blue-500 text-white px-3 py-2 min-w-[100px] rounded cursor-pointer">Save</button>
                        <button onClick={() => { setIsEditing(false); setCurrentVehicle(null); }} className="bg-gray-500 text-white px-3 py-2 min-w-[100px] rounded ml-2 cursor-pointer">Cancel</button>
                    </form>
                ) : (
                    <button onClick={() => setCurrentVehicle({})} className="border-2 border-slate-600 text-slate-900 hover:bg-slate-700 hover:text-white p-2 rounded mb-4 cursor-pointer">Add New Vehicle</button>
                )}

                <div className="bg-white rounded-md shadow-md border overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">Number</th>
                                <th className="px-4 py-2 text-left">Driver</th>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="pl-2 pr-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(vehicle => (
                                <tr key={vehicle.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap">{vehicle.id}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{vehicle.number}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{vehicle.driver?.name || vehicle.driverName || vehicle.driver}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{vehicle.type}</td>
                                    <td className="px-4 py-2 whitespace-nowrap max-w-[70px]">
                                        <button onClick={() => handleEdit(vehicle)} className="bg-yellow-500 text-white px-3 py-2 min-w-[70px] rounded cursor-pointer">Edit</button>
                                        <button onClick={() => handleDelete(vehicle.id)} className="bg-red-500 text-white px-3 py-2 min-w-[70px] rounded ml-2 cursor-pointer">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}