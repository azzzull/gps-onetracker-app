import L from 'leaflet';

export const carIcon = new L.Icon({
    iconUrl: '/icons/truck.png',
    iconSize: [50, 50],
    iconAnchor: [16, 16],
    popupAnchor: [0, 0]
});

export const carIconInactive = new L.Icon({
    iconUrl: '/icons/truck.png', // gunakan icon abu-abu jika ada, atau filter CSS
    iconSize: [50, 50],
    iconAnchor: [16, 16],
    popupAnchor: [0, 0],
    className: 'grayscale' // gunakan filter CSS di marker
});
