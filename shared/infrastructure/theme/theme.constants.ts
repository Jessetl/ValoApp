import { Platform } from 'react-native';

/**
 * Tokens semánticos: cada nombre describe el ROL del color, no su valor.
 * Esto permite que light y dark tengan valores completamente distintos
 * sin cambiar ni una línea de código en los componentes.
 */
export const ThemeColors = {
  light: {
    // --- Degradado de fondo (LinearGradient) ---
    gradientStart: '#093923', // verde oscuro — parte superior
    gradientEnd: '#94C8B5', // verde menta suave — parte inferior

    // --- Superficies ---
    background: '#094030', // color medio del degradado para fallback
    backgroundSecondary: '#FFFFFF', // blanco puro — cards
    backgroundTertiary: '#F0F4F2', // gris muy claro — items dentro de cards

    // --- Texto ---
    text: '#FFFFFF', // blanco — títulos sobre fondo oscuro/degradado
    textSecondary: '#718096', // gris pizarra — subtítulos, labels
    textTertiary: '#718096', // gris pizarra — placeholders
    textOnSurface: '#1A202C', // gris carbón — texto dentro de cards
    textInverse: '#1A202C', // texto sobre superficies claras

    // --- Primario (Verde vibrante — acción principal) ---
    primary: '#63E696', // verde vibrante — botones, checkbox, gráficos
    primaryLight: '#E0F8EA', // verde muy claro — badges, backgrounds sutiles
    primaryDark: '#3FBF6E', // verde medio — hover, pressed states

    // --- Éxito (Verde — ganancias, ingresos, positivo) ---
    success: '#63E696', // verde vibrante — ingresos, balance positivo
    successLight: '#E0F8EA', // verde claro — badge de ingreso
    successDark: '#3FBF6E', // verde medio — pressed

    // --- Peligro / Deudas (Coral/Naranja suave) ---
    danger: '#FF8C66', // coral naranja — gastos, deudas, botón pagar
    dangerLight: '#FFF0EB', // coral muy claro — badge de gasto
    dangerDark: '#E06B42', // coral oscuro — pressed

    // --- Advertencia ---
    warning: '#FFB84D', // ámbar dorado — presupuesto al límite
    warningLight: '#FFF5E0', // ámbar claro — badge
    warningDark: '#E09A2B', // ámbar oscuro — pressed

    // --- Bordes y separadores ---
    border: '#E2E8F0', // gris claro — bordes de cards
    borderLight: '#EDF2F7', // gris muy claro — separadores sutiles
    borderFocus: '#63E696', // mismo que primary — focus rings

    // --- Sombras ---
    shadow: '#000000',

    // --- Tab bar ---
    tint: '#093923',
    tabIconDefault: '#94C8B5',
    tabIconSelected: '#093923',
    tabBarBackground: '#FFFFFF',
    tabActiveBackground: '#093923',
    tabActiveIcon: '#FFFFFF',

    // --- StatusBar ---
    statusBar: 'light' as const, // texto claro sobre fondo oscuro
  },

  dark: {
    // --- Degradado de fondo (LinearGradient) ---
    gradientStart: '#041A10', // verde muy oscuro profundo
    gradientEnd: '#0D3D2A', // verde oscuro medio

    // --- Superficies ---
    background: '#071F14', // verde profundo — fallback
    backgroundSecondary: '#112A1E', // verde oscuro — cards
    backgroundTertiary: '#1A3829', // verde oscuro claro — items dentro de cards

    // --- Texto ---
    text: '#F0F4F2', // blanco verdoso — texto principal
    textSecondary: '#8BA39A', // gris verdoso — subtítulos
    textTertiary: '#6B8A7E', // gris verde oscuro — placeholders
    textOnSurface: '#F0F4F2', // texto claro dentro de cards (dark)
    textInverse: '#071F14', // texto oscuro sobre superficies claras

    // --- Primario ---
    primary: '#63E696', // verde vibrante — se mantiene en dark
    primaryLight: '#0F2E1A', // verde oscuro — badge background sutil
    primaryDark: '#4ACC7E', // verde medio — pressed

    // --- Éxito ---
    success: '#63E696', // verde vibrante
    successLight: '#0F2E1A', // verde oscuro — badge
    successDark: '#4ACC7E', // verde medio — pressed

    // --- Peligro / Deudas ---
    danger: '#FF8C66', // coral naranja — se mantiene
    dangerLight: '#2D1A12', // coral oscuro — badge
    dangerDark: '#FF7A4D', // coral intenso — pressed

    // --- Advertencia ---
    warning: '#FFB84D', // ámbar
    warningLight: '#2D2210', // ámbar oscuro — badge
    warningDark: '#E09A2B', // ámbar pressed

    // --- Bordes ---
    border: '#1E4A35', // verde oscuro medio
    borderLight: '#163D2B', // verde oscuro
    borderFocus: '#63E696', // mismo que primary

    // --- Sombras ---
    shadow: '#000000',

    // --- Tab bar ---
    tint: '#63E696',
    tabIconDefault: '#6B8A7E',
    tabIconSelected: '#63E696',
    tabBarBackground: '#112A1E',
    tabActiveBackground: '#63E696',
    tabActiveIcon: '#071F14',

    // --- StatusBar ---
    statusBar: 'light' as const,
  },
} as const;

/** Tipo para acceder a cualquier token de color de forma type-safe */
export type ThemeColorKey = keyof typeof ThemeColors.light;

/** Tipo del esquema de color */
export type ColorScheme = 'light' | 'dark';

/** Sombra de card por plataforma — Platform.select (mecanismo 1: solo valores de estilo) */
export const CardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  android: {
    elevation: 2,
  },
  default: {},
});

/** Sombra elevada por plataforma */
export const ElevatedShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  android: {
    elevation: 6,
  },
  default: {},
});

/** Fuentes por plataforma */
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    sansMedium: 'System',
    sansBold: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'Roboto',
    sansMedium: 'Roboto',
    sansBold: 'Roboto',
    mono: 'monospace',
  },
});
