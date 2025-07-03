import React, { createContext, useContext, useState } from 'react';

const VehicleFilterContext = createContext();

export function VehicleFilterProvider({ children }) {
  const [selectedPlates, setSelectedPlates] = useState(['all']);

  // Fungsi untuk reset filter ke default
  const resetFilter = () => setSelectedPlates(['all']);

  return (
    <VehicleFilterContext.Provider value={{ selectedPlates, setSelectedPlates, resetFilter }}>
      {children}
    </VehicleFilterContext.Provider>
  );
}

export function useVehicleFilter() {
  return useContext(VehicleFilterContext);
}
