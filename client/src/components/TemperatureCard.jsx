export default function TemperatureCard() {
    const temperature = 30.5;

    return (
        <div
            className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">🌡 Suhu Terkini</h2>
            <p className="text-6xl font-bold text-red-500">{temperature}°C</p>
            <span className="mt-2 text-gray-500 text-sm">Update terakhir: 5 detik lalu</span>
        </div>
    );
}
