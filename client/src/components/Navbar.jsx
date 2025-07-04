import { FaBell } from "react-icons/fa";
import { useState, useContext } from 'react';
import Select from 'react-select';
import { useVehicleFilter } from './VehicleFilterContext';
import DatePicker from 'react-datepicker';
import "../datepicker.css";
import { selectStyles } from './selectStyles.js';
import makeAnimated from 'react-select/animated';
import AuthContext from './AuthContext';

const animatedComponents = makeAnimated();

export default function Navbar({ page, selectedDate, setSelectedDate, vehicleIds = [], alertVehicles }) {
    const { selectedPlates, setSelectedPlates } = useVehicleFilter();
    const { setShowLogin } = useContext(AuthContext);
    const [showNotification, setShowNotification] = useState(false);

    const vehicleOptions = [...vehicleIds]
        .sort((a, b) => a.localeCompare(b))
        .map(id => ({
            value: id,
            label: id
        }));

    return (
        <div className="w-full h-[8ch] px-12 bg-slate-100 flex items-center justify-between">
            {page === 'dashboard' && (
                <>
                    <div className="w-96"></div>
                    <div className="flex items-center gap-x-8">
                        <div className="relative">
                            <button onClick={() => setShowNotification(!showNotification)} className="relative cursor-pointer">
                                {alertVehicles.length > 0 && (
                                    <div className="w-5 h-5 bg-zinc-50 flex items-center justify-center absolute -top-1.5 -right-2.5 rounded-full p-0.5">
                                        <span className="bg-red-600 text-white rounded-full w-full h-full flex items-center justify-center text-xs">
                                            {alertVehicles.length}
                                        </span>
                                    </div>
                                )}
                                <FaBell className="text-xl" />
                            </button>
                            {showNotification && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2">Notifikasi Suhu</h3>
                                        {alertVehicles.length > 0 ? (
                                            <ul>
                                                {alertVehicles.map(v => (
                                                    <li key={v.id} className="text-sm border-b py-2">
                                                        <p className="font-bold text-red-600">Suhu Tidak Normal</p>
                                                        <p>{v.plate} - {v.driver}</p>
                                                        <p>Lokasi: {v.location}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>Tidak ada notifikasi</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowLogin(true)}
                            className="border-2 border-slate-600 text-slate-900 hover:bg-slate-700 hover:text-white font-bold py-2 px-4 rounded cursor-pointer"
                        >
                            Login Admin
                        </button>
                    </div>
                </>
            )}

            {page === 'realtime' && (
                <div className="w-full flex items-center gap-4 justify-between mt-3">
                    <h1 className="text-xl font-semibold text-zinc-700 -left-3">Realtime Position</h1>
                    <div className="min-w-[260px]">
                        <Select
                            isMulti
                            placeholder="Pilih atau cari kendaraan..."
                            options={vehicleOptions}
                            components={animatedComponents}
                            value={vehicleOptions.filter(opt => selectedPlates.includes(opt.value))}
                            onChange={opts => setSelectedPlates(opts.map(opt => opt.value))}
                            className="min-w-[220px] text-sm rounded-md"
                            classNamePrefix="react-select"
                            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }), ...selectStyles,
                            }}
                        />
                    </div>
                </div>
            )}

            {page === 'mapview' && (
                <div className="w-full flex items-center gap-4 mt-3 justify-between">
                    <h1 className="text-xl font-semibold text-zinc-700 -left-3">MapView</h1>
                    <div className="flex items-center gap-4">
                        <div className="min-w-[260px]">
                            <Select
                                placeholder="Pilih atau cari kendaraan..."
                                options={vehicleOptions}
                                value={vehicleOptions.find(opt => opt.value === selectedPlates[0]) || null}
                                onChange={opt => {
                                    setSelectedPlates(opt ? [opt.value] : []);
                                }}
                                isClearable
                                classNamePrefix="react-select"
                                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                                styles={{
                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                    ...selectStyles,
                                }}
                            />
                        </div>

                        <div className="min-w-[200px]">
                            <DatePicker
                                selected={selectedDate ? new Date(selectedDate) : null}
                                onChange={(date) => {
                                    if (!date) return setSelectedDate(null);

                                    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                    setSelectedDate(localDate);
                                }}
                                dateFormat="dd-MM-yyyy"
                                placeholderText="Pilih tanggal"
                                isClearable
                            />
                        </div>
                    </div>
                </div>
            )}

            {page === 'history' && (
                <div className="w-full flex justify-between items-center mt-3">
                    <h1 className="text-xl font-semibold text-zinc-700 -left-3">Vehicle History Log</h1>
                </div>
            )}
        </div>
    );
}
