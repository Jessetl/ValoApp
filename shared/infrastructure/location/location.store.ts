import * as Location from 'expo-location';
import { create } from 'zustand';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationState {
  /** Coordenadas actuales del dispositivo */
  coords: LocationCoords | null;
  /** Estado del permiso de localización */
  permissionStatus: Location.PermissionStatus | null;
  /** Si se está obteniendo la ubicación */
  isLoading: boolean;
  /** Solicita permisos y obtiene la ubicación */
  requestLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>()((set, get) => ({
  coords: null,
  permissionStatus: null,
  isLoading: false,

  requestLocation: async () => {
    // Evitar múltiples solicitudes simultáneas
    if (get().isLoading) return;

    set({ isLoading: true });

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      set({ permissionStatus: status });

      if (status !== Location.PermissionStatus.GRANTED) {
        set({ isLoading: false });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      set({
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
