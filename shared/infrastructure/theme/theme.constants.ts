import { Platform } from 'react-native';

/**
 * Tokens semánticos: cada nombre describe el ROL del color, no su valor.
 * Esto permite que light y dark tengan valores completamente distintos
 * sin cambiar ni una línea de código en los componentes.
 */
export const ThemeColors = {
  light: {
    // --- Superficies ---
    background: '#FAFBFC', // hsl(210, 20%, 98%) — fondo principal limpio
    backgroundSecondary: '#F1F3F5', // hsl(210, 14%, 95%) — cards, secciones
    backgroundTertiary: '#E9ECEF', // hsl(210, 12%, 92%) — inputs, badges deshabilitados

    // --- Texto ---
    text: '#1A1D21', // hsl(216, 14%, 11%) — texto principal, alta legibilidad
    textSecondary: '#5F6B7A', // hsl(213, 12%, 42%) — subtítulos, labels
    textTertiary: '#8B95A3', // hsl(213, 12%, 59%) — placeholders, texto deshabilitado
    textInverse: '#FFFFFF', // texto sobre superficies oscuras

    // --- Primario (Azul financiero — confianza, estabilidad) ---
    primary: '#1A6DDB', // hsl(215, 76%, 48%) — botones, links, acciones principales
    primaryLight: '#E8F1FD', // hsl(215, 85%, 95%) — badges, backgrounds sutiles
    primaryDark: '#0F4A99', // hsl(215, 76%, 33%) — hover, pressed states

    // --- Éxito (Verde — ganancias, ingresos, positivo) ---
    success: '#0D8A4A', // hsl(150, 82%, 30%) — ingresos, balance positivo
    successLight: '#E6F7EE', // hsl(150, 60%, 93%) — badge de ingreso
    successDark: '#06663A', // hsl(150, 82%, 22%) — pressed

    // --- Peligro (Rojo — gastos, pérdidas, alertas) ---
    danger: '#D42B2B', // hsl(0, 67%, 50%) — gastos, deudas, errores
    dangerLight: '#FDE8E8', // hsl(0, 85%, 95%) — badge de gasto
    dangerDark: '#A31F1F', // hsl(0, 67%, 38%) — pressed

    // --- Advertencia (Ámbar — atención, presupuesto límite) ---
    warning: '#D4890B', // hsl(38, 90%, 44%) — presupuesto al límite, pendientes
    warningLight: '#FEF3E2', // hsl(38, 90%, 94%) — badge de advertencia
    warningDark: '#9C6508', // hsl(38, 90%, 32%) — pressed

    // --- Bordes y separadores ---
    border: '#DEE2E6', // hsl(210, 14%, 89%) — bordes de cards
    borderLight: '#E9ECEF', // hsl(210, 12%, 92%) — separadores sutiles
    borderFocus: '#1A6DDB', // mismo que primary — focus rings

    // --- Sombras (solo iOS, Android usa elevation) ---
    shadow: '#000000',

    // --- Tab bar ---
    tint: '#1A6DDB',
    tabIconDefault: '#8B95A3',
    tabIconSelected: '#1A6DDB',

    // --- StatusBar ---
    statusBar: 'dark' as const,
  },

  dark: {
    // --- Superficies ---
    background: '#0D1117', // hsl(215, 28%, 7%) — fondo profundo, descansa la vista
    backgroundSecondary: '#161B22', // hsl(215, 25%, 11%) — cards
    backgroundTertiary: '#21262D', // hsl(215, 18%, 15%) — inputs, badges

    // --- Texto ---
    text: '#F0F3F6', // hsl(210, 25%, 95%) — texto principal
    textSecondary: '#8B949E', // hsl(210, 8%, 58%) — subtítulos
    textTertiary: '#6E7681', // hsl(215, 7%, 47%) — placeholders
    textInverse: '#1A1D21', // texto sobre superficies claras

    // --- Primario ---
    primary: '#4A9EF5', // hsl(215, 88%, 63%) — más luminoso para contraste en dark
    primaryLight: '#172336', // hsl(215, 45%, 15%) — badge background sutil
    primaryDark: '#2B7FE0', // hsl(215, 76%, 53%) — pressed

    // --- Éxito ---
    success: '#2EA66B', // hsl(150, 55%, 42%) — más brillante en dark
    successLight: '#0D2818', // hsl(150, 50%, 10%) — badge
    successDark: '#1D8A55', // hsl(150, 65%, 33%) — pressed

    // --- Peligro ---
    danger: '#F56565', // hsl(0, 88%, 68%) — más suave, menos agresivo en dark
    dangerLight: '#2D1515', // hsl(0, 40%, 13%) — badge
    dangerDark: '#E04545', // hsl(0, 72%, 57%) — pressed

    // --- Advertencia ---
    warning: '#F0A830', // hsl(38, 87%, 56%) — más luminoso
    warningLight: '#2D2010', // hsl(38, 50%, 12%) — badge
    warningDark: '#D4930A', // hsl(38, 90%, 44%) — pressed

    // --- Bordes ---
    border: '#30363D', // hsl(215, 13%, 21%)
    borderLight: '#21262D', // hsl(215, 18%, 15%)
    borderFocus: '#4A9EF5', // mismo que primary

    // --- Sombras ---
    shadow: '#000000',

    // --- Tab bar ---
    tint: '#4A9EF5',
    tabIconDefault: '#6E7681',
    tabIconSelected: '#4A9EF5',

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
