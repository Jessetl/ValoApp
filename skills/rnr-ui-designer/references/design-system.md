# Sistema de Diseño — Referencia

Guía detallada del sistema de diseño: colores HSL, tipografía, espaciado, diferencias iOS/Android, accesibilidad y utilidades. Lee esta referencia cuando necesites implementar tokens de color, ajustar tipografía, o verificar accesibilidad.

## Tabla de Contenidos

1. [Sistema de Color con CSS Variables HSL](#sistema-de-color-con-css-variables-hsl)
2. [Tipografía](#tipografía)
3. [Espaciado y Layout](#espaciado-y-layout)
4. [Diferencias iOS vs Android](#diferencias-ios-vs-android)
5. [Accesibilidad](#accesibilidad)
6. [Utilidad cn() para Merge de Clases](#utilidad-cn-para-merge-de-clases)
7. [PortalHost para Overlays](#portalhost-para-overlays)

---

## Sistema de Color con CSS Variables HSL

RNR usa CSS variables con valores HSL definidas en `global.css` y mapeadas en `tailwind.config.js`. Todos los colores se referencian a través de tokens semánticos, NUNCA con colores directos.

**Tokens semánticos del tema (global.css):**

```css
@layer base {
  :root {
    --background: 0 0% 100%; /* Fondo principal */
    --foreground: 240 10% 3.9%; /* Texto principal */
    --card: 0 0% 100%; /* Fondo de cards */
    --card-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%; /* Acción principal */
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%; /* Acción secundaria */
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%; /* Elementos deshabilitados/sutiles */
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%; /* Destacados hover/focus */
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%; /* Errores/eliminar */
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%; /* Bordes */
    --input: 240 5.9% 90%; /* Bordes de inputs */
    --ring: 240 5.9% 10%; /* Focus ring */
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    /* ... valores invertidos para dark mode */
  }
}
```

**Mapeo en tailwind.config.js:**

```javascript
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  // ... todos los tokens semánticos
}
```

**Reglas de color:**

- NUNCA uses colores hardcodeados (`bg-red-500`, `text-blue-600`). Usa SIEMPRE tokens semánticos (`bg-primary`, `text-destructive`).
- El único lugar donde se definen colores concretos es `global.css`.
- Para colores custom del negocio (ej. verde de éxito, naranja de warning), crea nuevos tokens en `global.css` y regístralos en `tailwind.config.js`.
- Para opacidad, usa el modificador: `bg-primary/80` (80% de opacidad del primary).

---

## Tipografía

React Native **NO tiene herencia de estilos en cascada**. Cada `<Text>` debe tener sus clases aplicadas directamente.

**Escala tipográfica recomendada:**

| Uso | Clase NativeWind | Tamaño aprox. |
|---|---|---|
| Hero / Display | `text-4xl font-bold` | 36px |
| Título de pantalla | `text-2xl font-bold` | 24px |
| Título de sección | `text-xl font-semibold` | 20px |
| Subtítulo | `text-lg font-medium` | 18px |
| Body | `text-base` | 16px |
| Caption / Metadata | `text-sm text-muted-foreground` | 14px |
| Micro / Labels | `text-xs text-muted-foreground` | 12px |

**Regla crítica de RN:** cada `<Text>` necesita su propia clase de color. No puedes poner `text-foreground` en un `<View>` y esperar que herede a los `<Text>` hijos.

```tsx
// ❌ INCORRECTO — React Native no hereda estilos de texto
<View className="text-foreground">
  <Text>Este texto NO tendrá color</Text>
</View>

// ✅ CORRECTO — cada Text tiene su propio estilo
<View>
  <Text className="text-foreground">Este texto SÍ tendrá color</Text>
</View>
```

**Implementación de jerarquía:**

```tsx
<Text className="text-3xl font-bold text-foreground">Título Principal</Text>
<Text className="text-lg font-semibold text-foreground">Subtítulo</Text>
<Text className="text-base text-foreground">Contenido del body</Text>
<Text className="text-sm text-muted-foreground">Hace 5 minutos</Text>
```

---

## Espaciado y Layout

Usa la escala de Tailwind consistentemente. La unidad base es 4px.

**Reglas de espaciado:**

- **Padding de pantalla:** `px-4` (16px) en los laterales, `pt-6` o `pt-12` arriba según si hay header.
- **Gap entre secciones:** `gap-6` (24px) o `gap-8` (32px).
- **Gap entre elementos de una lista:** `gap-3` (12px) o `gap-4` (16px).
- **Padding interno de cards:** `p-4` (16px) o `p-6` (24px).
- **Margen entre label e input:** `gap-1.5` (6px).

**SafeArea:** SIEMPRE usa `SafeAreaView` o el equivalente de Expo para respetar notch, island, y barras de navegación.

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

export function ScreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className='flex-1 bg-background' edges={['top']}>
      <ScrollView
        className='flex-1'
        contentContainerClassName='px-4 pt-6 pb-8 gap-6'
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## Diferencias iOS vs Android

| Aspecto          | iOS                                                      | Android                                      |
| ---------------- | -------------------------------------------------------- | -------------------------------------------- |
| Shadows          | `shadow-sm`, `shadow-md` (box-shadow nativo)             | `elevation-2`, `elevation-4` (elevation API) |
| Haptics          | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` | `Haptics.impactAsync()` (más limitado)       |
| Status bar       | Light/dark content automático                            | Necesita `StatusBar` explícito               |
| Bottom safe area | Home indicator (34px)                                    | Navigation bar (variable)                    |
| Scroll behavior  | Bounce natural                                           | OverScroll glow                              |
| Fonts            | SF Pro (sistema)                                         | Roboto (sistema)                             |

**Regla:** diseña componentes que se sientan nativos en AMBAS plataformas. Usa `Platform.select()` solo para ajustes visuales específicos.

```tsx
import { Platform } from 'react-native';

// Shadow cross-platform
const cardShadow = Platform.select({
  ios: 'shadow-sm shadow-black/5',
  android: 'elevation-2',
});

<Card className={`bg-card ${cardShadow}`}>
```

---

## Accesibilidad

Cada componente DEBE ser accesible. RNR ya incluye accesibilidad vía `@rn-primitives` (port de Radix UI), pero al componer o personalizar debes verificar:

**Checklist obligatorio:**

- `accessibilityLabel` en todo elemento interactivo que no tenga texto visible.
- `accessibilityRole` apropiado (`button`, `link`, `header`, `image`, `checkbox`, etc.).
- `accessibilityState` para estados (`disabled`, `checked`, `selected`, `expanded`).
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande (>18px bold o >24px).
- Zonas táctiles mínimas de 44x44 puntos (iOS) / 48x48 dp (Android).
- `accessibilityHint` para acciones no obvias.

```tsx
<Button
  className='h-12 px-6'
  accessibilityLabel='Agregar producto al carrito'
  accessibilityRole='button'
  accessibilityHint='Agrega este producto a tu carrito de compras'
>
  <Text className='text-primary-foreground font-semibold'>
    Agregar al carrito
  </Text>
</Button>
```

**Foco y navegación:** asegúrate de que el orden de foco siga la jerarquía visual de arriba a abajo, izquierda a derecha.

---

## Utilidad `cn()` para Merge de Clases

SIEMPRE usa la función `cn()` cuando combines clases NativeWind de forma condicional. Esta función vive en `lib/utils.ts` y combina `clsx` + `tailwind-merge`:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Uso:**

```tsx
<View className={cn(
  'rounded-xl p-4 border border-border',
  isActive && 'border-primary bg-primary/5',
  isDisabled && 'opacity-50',
)}>
```

---

## PortalHost para Overlays

RNR requiere `<PortalHost />` en el root layout para que componentes como Dialog, DropdownMenu, Popover, Tooltip y ContextMenu funcionen correctamente:

```tsx
// app/_layout.tsx
import { PortalHost } from '@rn-primitives/portal';

export default function RootLayout() {
  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <Stack />
      <PortalHost />
    </ThemeProvider>
  );
}
```

**Regla:** si el componente usa un overlay o portal, verifica que `<PortalHost />` esté montado. Sin esto, los overlays simplemente no aparecen.
