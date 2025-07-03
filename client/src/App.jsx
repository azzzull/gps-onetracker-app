import { useState, useEffect } from 'react';
import Sidebar from './components/sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Realtime from './components/Realtime';
import './index.css';
import MapView from './components/MapView';
import History from './components/History';
import { fetchAllVehicles } from './utils/fetchAllVehicles';
import { VehicleFilterProvider } from './components/VehicleFilterContext';

function App() {
    const [activePage, setActivePage] = useState('dashboard');
    const [selectedDate, setSelectedDate] = useState('');
    const [vehicleIds, setVehicleIds] = useState([]);
    const [focusedVehicle, setFocusedVehicle] = useState(null);
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        fetchAllVehicles()
            .then(data => {
                setVehicles(data);
                setVehicleIds(data.map(v => v.id)); // Selalu gunakan id
            })
            .catch(() => setVehicles([]));
    }, []);

    return (
        <VehicleFilterProvider>
            <div className="flex w-full min-h-screen font-Poppins">
                <Sidebar setActivePage={setActivePage} activePage={activePage} />
                <div className="flex-1 flex flex-col">
                    <Navbar
                    page={activePage}
                    vehicleIds={vehicleIds}
                    setFocusedVehicle={setFocusedVehicle}
                    focusedVehicle={focusedVehicle}
                    vehicles={vehicles}
                    />
                    {activePage === 'dashboard' && <Dashboard />}
                    {activePage === 'realtime' && (
                    <Realtime
                        vehicles={vehicles}
                    />
                    )}
                    {activePage === 'mapview' && <MapView vehicles={vehicles} />}
                    {activePage === 'history' && <History />}
                </div>
            </div>
        </VehicleFilterProvider>
    );
}

export default App;
