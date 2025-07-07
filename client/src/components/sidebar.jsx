import {
    ChartSpline,
    Navigation,
    Map,
    History,
    PanelLeftOpen,
    PanelLeftClose,
    UserCog,
    LogOut
} from 'lucide-react';
import { useState, useContext } from 'react';
import { useVehicleFilter } from './VehicleFilterContext';
import AuthContext from './AuthContext';

export default function Sidebar({ activePage, setActivePage }) {
    const { resetFilter } = useVehicleFilter();
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
    const [open,
        setOpen] = useState(true);
    const [subMenusm,
        setSubMenus] = useState({realTimePos: false, historyLog: false});

    const handleLogout = () => {
        setIsAuthenticated(false);
        setActivePage('dashboard');
    };

    const toggleSubMenu = (menu) => {
        setSubMenus((prev) => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const Menus = [
        {
            title: "Dashboard",
            key: "dashboard",
            icon: <ChartSpline/>
        }, {
            title: "Realtime Position",
            key: "realtime",
            icon: <Navigation/>
        }, {
            title: "Map View",
            key: "mapview",
            icon: <Map/>
        }, {
            title: "History Log",
            key: "history",
            icon: <History/>
        },
    ];

    if (isAuthenticated) {
        Menus.push({
            title: "Admin",
            key: "admin",
            icon: <UserCog />,
        });
    }
    return (
        <div
            className={`flex flex-col ${open
                ? "w-65 p-5"
                : "w-20 p-4"} h-screen pt-8 bg-slate-100 relative duration-300 ease-in-out`}>

            {/* Toggle button sections */}
            <div
                className={`bg-slate-800 h-10 w-10 absolute top-1/2 -translate-y-1/2 -right-7.5 z-50 cursor-pointer text-slate-400 p-0.5 flex items-center justify-center transition-all duration-300 rounded-full shadow-md`}
                onClick={() => setOpen(!open)}>
                {!open
                    ? <PanelLeftOpen />
                    : <PanelLeftClose />}
            </div>

            {/* Logo and title section */}
            <div className={`flex gap-x-4 items-center ${!open && "ml-0.5"}`}>
                <img
                    src="https://cdn.pixabay.com/photo/2017/02/18/19/20/logo-2078018_640.png"
                    alt="logo"
                    className={`w-10 h-10 rounded-full object-cover object-center cursor-pointer ease-in-out duration-3 ml-1`} />

                <h1
                    className={`text-slate-800 origin-left font-semibold text-xl duration-200 ease-in-out mr-15 ${!open && "scale-0"}`}>
                    OneTracker
                </h1>
            </div>

            {/* Sidebar Navbar Items section */}
            <div className="flex-grow">
                <ul className="pt-6 space-y-0.5">
                    {Menus.map((Menu, index) => (
                        <li
                            key={index}
                            onClick={() => {
                                setActivePage(Menu.key);
                                resetFilter(); // Reset filter kendaraan setiap pindah menu
                            }}
                            className={`group flex items-center gap-x-4 rounded-md cursor-pointer transition-all duration-300 ease-in-out ${Menu.gap
                                ? "mt-9"
                                : "mt-2"} ${activePage === Menu.key
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-500 hover:bg-slate-300 hover:text-slate-800"} ${open
                                        ? "py-3 px-4 justify-start"
                                        : "p-3 justify-center"}`}>

                            <div
                                className={`flex items-center justify-between gap-x-4 ${open && "w-50"}`}
                                onClick={() => toggleSubMenu(Menu.key)}>
                                <div className="flex items-center gap-2 ">
                                    <span className="text-lg">
                                        {Menu.icon}
                                    </span>
                                    <span className={`${!open && "hidden"} origin-left ease-in-out duration-300`}>
                                        {Menu.title}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {isAuthenticated && (
                <ul className="pt-2">
                    <li
                        onClick={handleLogout}
                        className={`group flex items-center gap-x-4 rounded-md cursor-pointer transition-all duration-300 ease-in-out text-slate-500 hover:bg-slate-300 hover:text-slate-800 ${open
                            ? "py-3 px-4 justify-start"
                            : "p-3 justify-center"}`}>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">
                                <LogOut />
                            </span>
                            <span className={`${!open && "hidden"} origin-left ease-in-out duration-300`}>
                                Logout
                            </span>
                        </div>
                    </li>
                </ul>
            )}
        </div>
    );
}