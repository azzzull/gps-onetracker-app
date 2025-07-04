import { FaSearch, FaBell } from "react-icons/fa";
import { Funnel } from 'lucide-react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useVehicleFilter } from './VehicleFilterContext';
import DatePicker from 'react-datepicker';
import "../datepicker.css";
import { selectStyles } from './selectStyles.js'; // pastikan file ini sama seperti di history log
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

export default function Navbar({ page, selectedDate, setSelectedDate, vehicleIds = [], vehicles }) {
    const { selectedPlates, setSelectedPlates } = useVehicleFilter();

    // Hapus fetchPlates, gunakan vehicleIds dari props

    const vehicleOptions = [...vehicleIds]
        .sort((a, b) => a.localeCompare(b))
        .map(id => ({
            value: id,
            label: id // hanya tampilkan id saja
        }));

    return (
        <div className="w-full h-[8ch] px-12 bg-slate-100 flex items-center justify-between">
            {page === 'dashboard' && (
                <>
                    {/* Search Bar */}
                    <div className="w-96 border border-zinc-300 rounded-md h-11 flex items-center justify-center">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="flex-1 h-full rounded-md outline-none border-none bg-zinc-50 px-4"
                        />
                        <button className="px-4 h-full flex items-center justify-center text-base text-zinc-600 border-l border-zinc-300">
                            <FaSearch />
                        </button>
                    </div>

                    {/* Notification & Profile */}
                    <div className="flex items-center gap-x-8">
                        <button className="relative">
                            <div className="w-5 h-5 bg-zinc-50 flex items-center justify-center absolute -top-1.5 -right-2.5 rounded-full p-0.5">
                                <span className="bg-red-600 text-white rounded-full w-full h-full flex items-center justify-center text-xs">
                                    3
                                </span>
                            </div>
                            <FaBell className="text-xl" />
                        </button>

                        <img
                            src="https://cdn.pixabay.com/photo/2016/11/21/11/17/model-1844729_640.jpg"
                            alt="profile"
                            className="w-11 h-11 rounded-full object-cover object-center cursor-pointer"
                        />
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
                                setSelectedDate(localDate); // simpan sebagai string "YYYY-MM-DD"
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
