# Código Específico por Plataforma — Referencia

Guía detallada con ejemplos de código para los 3 mecanismos de platform-specific code. Lee esta referencia cuando necesites decidir cómo separar lógica entre iOS y Android y ver la implementación completa.

## Tabla de Contenidos

1. [Mecanismo 1: Platform.select()](#mecanismo-1-platformselect--diferencias-de-1-3-líneas)
2. [Mecanismo 2: Platform.OS](#mecanismo-2-platformos-con-bloques-condicionales--lógica-divergente-moderada)
3. [Mecanismo 3: Archivos .ios.tsx / .android.tsx](#mecanismo-3-archivos-iostsx--androidtsx--implementaciones-completamente-distintas)
4. [Reglas de archivos por plataforma](#reglas-de-archivos-por-plataforma)

---

## Mecanismo 1: `Platform.select()` — Diferencias de 1-3 líneas

Usa `Platform.select()` cuando la diferencia es un valor (un número, un string, un objeto de estilos) pero la lógica y estructura del componente son idénticas.

```typescript
import { Platform } from 'react-native';

// Sombras cross-platform (cada OS tiene su API)
const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
  default: {},
});

// Touch target mínimo por plataforma
const MIN_TOUCH_TARGET = Platform.select({
  ios: 44,
  android: 48,
  default: 44,
});

// Haptics con intensidad diferente por OS
const hapticStyle = Platform.select({
  ios: Haptics.ImpactFeedbackStyle.Light,
  android: Haptics.ImpactFeedbackStyle.Medium,
});
```

**Cuándo usar:** valores de estilo, constantes numéricas, configuraciones puntuales. Si el `Platform.select()` devuelve más de 5 líneas por plataforma, escala al mecanismo 2.

---

## Mecanismo 2: `Platform.OS` con bloques condicionales — Lógica divergente moderada

Usa `Platform.OS` cuando hay ramas de lógica distintas pero el componente comparte la mayor parte de su estructura.

```typescript
import { Platform } from 'react-native';

function NotificationHandler() {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // iOS requiere permiso explícito para notificaciones
      requestIOSNotificationPermission();
    }
    // Android 13+ requiere POST_NOTIFICATIONS, pero se maneja via AndroidManifest
    registerForPushNotifications();
  }, []);
}
```

**Cuándo usar:** permisos, APIs nativas con diferente flujo, configuraciones de arranque. Si el componente tiene más de 30% de su código dentro de `if (Platform.OS)`, escala al mecanismo 3.

---

## Mecanismo 3: Archivos `.ios.tsx` / `.android.tsx` — Implementaciones completamente distintas

Usa archivos separados cuando la implementación de cada plataforma es tan diferente que compartir código genera más complejidad que duplicarlo. React Native resuelve automáticamente el archivo correcto en build time — esto es tree-shaking gratuito porque el bundler solo incluye el archivo de la plataforma objetivo.

```
components/
├── video-player.tsx          ← Nunca se crea este (fallback/web)
├── video-player.ios.tsx      ← Usa AVPlayer nativo
└── video-player.android.tsx  ← Usa ExoPlayer nativo
```

```typescript
// video-player.ios.tsx
import { NativeVideoPlayer } from 'expo-av';

export function VideoPlayer({ uri }: VideoPlayerProps) {
  return <NativeVideoPlayer source={{ uri }} useNativeControls />;
}
```

```typescript
// video-player.android.tsx
import { NativeVideoPlayer } from 'expo-av';

export function VideoPlayer({ uri }: VideoPlayerProps) {
  return (
    <NativeVideoPlayer
      source={{ uri }}
      useNativeControls
      resizeMode="contain"
      // Android necesita configuración extra para streaming
      androidImplementation="ExoPlayer"
    />
  );
}
```

---

## Reglas de archivos por plataforma

### Interface de props compartida

La interface/props del componente deben ser **idénticas** en ambos archivos. Crea un archivo de tipos compartido:

```typescript
// video-player.types.ts  ← Tipos compartidos entre ambas implementaciones
export interface VideoPlayerProps {
  uri: string;
  autoPlay?: boolean;
  onComplete?: () => void;
}
```

### Reglas estrictas

- Nunca crees `.ios.tsx` sin crear `.android.tsx` (y viceversa). Siempre van en par, o se incluye un archivo base `.tsx` como fallback.
- Los imports desde otros archivos apuntan al nombre **sin extensión de plataforma**: `import { VideoPlayer } from './video-player'`. El bundler resuelve el archivo correcto.

### Ubicación de archivos por plataforma

Este skill decide **qué mecanismo** usar; `clean-architecture-frontend` decide **dónde** va el archivo. La regla general:

| Tipo de archivo platform-specific   | Ubicación (decide clean-architecture)                    |
| ----------------------------------- | -------------------------------------------------------- |
| Componente visual (.ios/.android)   | `features/[feature]/presentation/components/`            |
| Datasource nativo                   | `features/[feature]/infrastructure/datasources/`         |
| Hook con API nativa                 | `features/[feature]/presentation/hooks/`                 |
| Utilidad compartida                 | `shared/infrastructure/platform/`                        |
| Constante de plataforma             | `shared/infrastructure/platform/platform.constants.ts`   |
