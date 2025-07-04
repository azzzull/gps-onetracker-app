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
import AuthContext from './components/AuthContext';
import Login from './components/Login';
import Admin from './components/Admin';

function App() {
    const [activePage, setActivePage] = useState('dashboard');
    const [selectedDate, setSelectedDate] = useState('');
    const [vehicleIds, setVehicleIds] = useState([]);
    const [focusedVehicle, setFocusedVehicle] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [alertVehicles, setAlertVehicles] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLogin, setShowLogin] = useState(false);


    const fetchData = async () => {
        try {
            const fetchedVehicles = (await fetchAllVehicles()).sort((a, b) => a.id.localeCompare(b.id));
            setVehicles(fetchedVehicles);
            setVehicleIds(fetchedVehicles.map(v => v.id));

            const now = Date.now();
            let alerts = [];
            let activeCount = 0;
            await Promise.all(fetchedVehicles.map(async (v) => {
                try {
                    const res = await fetch(`http://localhost:5000/data?id=${v.id}&limit=1`);
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const last = data[0];
                        const lastTime = new Date(last.time).getTime();
                        const diff = (now - lastTime) / (1000 * 60 * 60);
                        if (diff <= 1) activeCount++;

                        const temp = last.container && last.container.temperature !== undefined ? parseFloat(last.container.temperature) : undefined;
                        if (temp !== undefined && temp > 20) {
                            let plate = v.plate || v.number || '-';
                            let driver = v.driver?.name || v.driverName || v.driver || '-';
                            let location = last.location_name || '-';
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
                } catch { }
            }));
            setAlertVehicles(alerts);
        } catch (err) {
            setVehicles([]);
            setAlertVehicles([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setShowLogin(false);
        setActivePage('admin');
    };


    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, showLogin, setShowLogin }}>
            <VehicleFilterProvider>
                <div className="flex w-full h-screen font-Poppins overflow-hidden">
                    <Sidebar setActivePage={setActivePage} activePage={activePage} />
                    <div className="flex-1 flex flex-col">
                        <Navbar
                            page={activePage}
                            vehicleIds={vehicleIds}
                            setFocusedVehicle={setFocusedVehicle}
                            focusedVehicle={focusedVehicle}
                            vehicles={vehicles}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            alertVehicles={alertVehicles}
                        />
                        <div className="flex-1 overflow-y-auto">
                            {activePage === 'dashboard' && <Dashboard alertVehicles={alertVehicles} vehicles={vehicles} />}
                            {activePage === 'realtime' && (
                                <Realtime
                                    vehicles={vehicles}
                                />
                            )}
                            {activePage === 'mapview' && <MapView vehicles={vehicles} selectedDate={selectedDate} />}
                            {activePage === 'history' && <History vehicles={vehicles} />}
                            {activePage === 'admin' && <Admin vehicles={vehicles} refreshData={fetchData} />}
                            {showLogin && <Login onLoginSuccess={handleLoginSuccess} />}
                        </div>
                    </div>
                </div>
            </VehicleFilterProvider>
        </AuthContext.Provider>
    );
}

export default App;
