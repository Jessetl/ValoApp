# Patrones de Optimización — Referencia

Guía detallada con código de referencia para cada técnica de optimización. Lee esta referencia cuando necesites implementar una optimización específica (listas, memoización, imágenes, startup, animaciones, re-renders, storage).

## Tabla de Contenidos

1. [Optimización de Listas](#optimización-de-listas)
2. [Memoización](#memoización--cuándo-sí-y-cuándo-no)
3. [Optimización de Imágenes](#optimización-de-imágenes)
4. [Optimización de Arranque](#optimización-de-arranque-startup-time)
5. [Optimización de Animaciones](#optimización-de-animaciones)
6. [Re-renders — Detección y Prevención](#re-renders--detección-y-prevención)
7. [Storage — MMKV vs AsyncStorage](#storage--mmkv-vs-asyncstorage)

---

## Optimización de Listas

Las listas son el punto de rendimiento más crítico en apps mobile. Una FlatList mal configurada es la causa #1 de jank.

### FlashList > FlatList

FlashList de Shopify recicla celdas como UITableView/RecyclerView nativo, en lugar de montar/desmontar componentes como FlatList. El resultado: rendimiento consistente incluso con miles de items.

```typescript
import { FlashList } from '@shopify/flash-list';

function MatchList({ matches }: { matches: Match[] }) {
  return (
    <FlashList
      data={matches}
      renderItem={({ item }) => <MatchCard match={item} />}
      estimatedItemSize={120} // Altura estimada en px — FlashList la necesita para calcular el reciclaje
      keyExtractor={(item) => item.id}
    />
  );
}
```

**`estimatedItemSize` es obligatorio.** FlashList lo usa para pre-calcular cuántas celdas mantener en el pool de reciclaje. Si no lo pones, FlashList te lo advierte en consola y el rendimiento degrada. Mídelo renderizando un item y checando su altura con `onLayout`, o estímalo visualmente.

### Reglas de Listas de Alto Rendimiento

```typescript
// ❌ INCORRECTO — renderItem con función inline y objeto nuevo cada render
<FlashList
  data={matches}
  renderItem={({ item }) => (
    <View style={{ padding: 16 }}>  {/* objeto nuevo cada render */}
      <Text>{item.name}</Text>
    </View>
  )}
/>

// ✅ CORRECTO — componente memoizado y estilos estables
const MatchCard = React.memo(function MatchCard({ match }: { match: Match }) {
  return (
    <View className="p-4">
      <Text className="text-foreground">{match.name}</Text>
    </View>
  );
});

function MatchList({ matches }: { matches: Match[] }) {
  const renderItem = useCallback(
    ({ item }: { item: Match }) => <MatchCard match={item} />,
    [],
  );

  return (
    <FlashList
      data={matches}
      renderItem={renderItem}
      estimatedItemSize={120}
      keyExtractor={getMatchId}
    />
  );
}

// keyExtractor también estable
const getMatchId = (item: Match) => item.id;
```

**Por qué importa:** cada vez que FlashList recicla una celda, llama a `renderItem`. Si `renderItem` es una función inline, React crea un nuevo componente cada vez → mount/unmount → adiós reciclaje. Con `useCallback` + `React.memo`, React reutiliza la misma instancia del componente y solo actualiza las props que cambiaron.

### Paginación Infinita

```typescript
function useInfiniteMatches() {
  return useInfiniteQuery({
    queryKey: ['matches'],
    queryFn: ({ pageParam = 1 }) => getMatchesUseCase.execute({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  });
}

function MatchList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMatches();

  const matches = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <FlashList
      data={matches}
      renderItem={renderItem}
      estimatedItemSize={120}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
    />
  );
}
```

---

## Memoización — Cuándo Sí y Cuándo No

La memoización tiene un costo: memoria para almacenar el resultado anterior y CPU para comparar dependencias. Solo vale la pena cuando el costo de recalcular es mayor que el costo de comparar.

### `React.memo` — Componentes que reciben props estables

```typescript
// ✅ USAR — componente hijo que se re-renderiza por re-render del padre sin cambio de props
const PlayerCard = React.memo(function PlayerCard({ player }: { player: Player }) {
  return (
    <Card className="p-4">
      <Text className="text-foreground font-semibold">{player.name}</Text>
      <Text className="text-muted-foreground text-sm">{player.position}</Text>
    </Card>
  );
});

// ❌ NO USAR — componente que siempre recibe props nuevas (un objeto/array creado inline)
// Memo no sirve de nada si las props cambian siempre
<PlayerCard player={{ name: 'Juan', position: 'Mid' }} />  // objeto nuevo cada render
```

### `useMemo` — Cálculos costosos

```typescript
// ✅ USAR — transformación de datos que no debe recalcularse en cada render
const sortedMatches = useMemo(
  () => matches.sort((a, b) => b.date.getTime() - a.date.getTime()),
  [matches],
);

// ✅ USAR — filtrado de una lista grande
const filteredPlayers = useMemo(
  () => players.filter((p) => p.position === selectedPosition),
  [players, selectedPosition],
);

// ❌ NO USAR — cálculo trivial
const fullName = useMemo(() => `${first} ${last}`, [first, last]);
// ↑ La comparación de deps cuesta más que la concatenación. Solo escribe:
const fullName = `${first} ${last}`;
```

### `useCallback` — Funciones pasadas como props

```typescript
// ✅ USAR — callback pasado a componente memoizado o a FlashList
const handlePress = useCallback((matchId: string) => {
  router.push(`/matches/${matchId}`);
}, [router]);

<MatchCard onPress={handlePress} />  // MatchCard es React.memo

// ❌ NO USAR — función que no se pasa como prop a un hijo memoizado
function LoginScreen() {
  // Este handleSubmit solo se usa localmente, no se pasa a un React.memo
  const handleSubmit = () => login.mutate(formData);
  return <Button onPress={handleSubmit}>Login</Button>;
}
```

### Regla de Oro de Memoización

```
¿El componente hijo usa React.memo?
  └─ No → useCallback/useMemo en las props no sirven de nada
  └─ Sí →
      ¿La prop es un objeto, array o función creada inline?
        └─ Sí → Envuélvela en useMemo/useCallback
        └─ No (primitivo, ref estable) → No necesita memo
```

---

## Optimización de Imágenes

Las imágenes son el mayor contribuyente al tamaño de la app y al consumo de memoria en runtime.

### `expo-image` > `Image` de React Native

```typescript
import { Image } from 'expo-image';

// ✅ CORRECTO — con placeholder blurhash, caché, y transición
<Image
  source={{ uri: player.avatarUrl }}
  placeholder={{ blurhash: player.avatarBlurhash }}
  contentFit="cover"
  transition={200}
  style={{ width: 80, height: 80, borderRadius: 40 }}
  recyclingKey={player.id}  // Crítico en listas para evitar flash de imagen incorrecta
/>
```

### Reglas de imágenes

| Regla | Por qué |
|-------|---------|
| Usa `expo-image`, no `Image` de RN | Caché en disco, blurhash, reciclaje en listas, transiciones |
| Siempre especifica `width` y `height` | Sin dimensiones, RN calcula layout 2 veces (measure → layout) |
| Usa `recyclingKey` en listas | Evita que al reciclar celdas se muestre la imagen del item anterior |
| Usa `contentFit` en vez de `resizeMode` | API moderna de expo-image, más predecible |
| Genera thumbnails en el backend | No descargues una imagen de 4000x3000 para mostrarla en 80x80 |
| Usa blurhash como placeholder | Mejor UX que un espacio vacío; el hash pesa ~30 bytes |

---

## Optimización de Arranque (Startup Time)

El tiempo desde que el usuario toca el ícono hasta que ve contenido interactivo es la primera impresión. Cada 100ms de mejora aumenta la retención.

### Reduce el JS Bundle

```typescript
// ❌ INCORRECTO — import de toda la librería
import { format, parse, addDays, subDays, isAfter, isBefore } from 'date-fns';

// ✅ CORRECTO — import solo lo que usas (tree-shakeable)
import { format } from 'date-fns/format';
import { addDays } from 'date-fns/addDays';
```

```typescript
// ❌ INCORRECTO — import barrel que trae todo el módulo
import { MatchCard, PlayerCard, CourtCard, StatsCard } from '@/components';

// ✅ CORRECTO — imports directos
import { MatchCard } from '@/components/cards/match-card';
import { PlayerCard } from '@/components/cards/player-card';
```

**Por qué los barrel imports son peligrosos:** un `index.ts` que re-exporta 50 componentes obliga al bundler a evaluar los 50, aunque solo uses 1. Hermes precompila a bytecode, pero el parsing y la inicialización de módulos siguen siendo lineales con el número de exports.

### Lazy Loading de Screens

Expo Router ya hace lazy loading de rutas por defecto. Pero puedes reforzarlo para componentes pesados dentro de una screen:

```typescript
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// El editor de estadísticas es pesado (charts, tablas). Se carga solo cuando se necesita.
const StatsEditor = lazy(() => import('../components/stats-editor'));

function MatchDetailScreen() {
  const [showStats, setShowStats] = useState(false);

  return (
    <View className="flex-1">
      <MatchHeader />
      {showStats && (
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <StatsEditor />
        </Suspense>
      )}
    </View>
  );
}
```

### Splash Screen Inteligente

No ocultes el splash screen hasta que la app esté lista para interactuar:

```typescript
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Precargar lo esencial: fonts, token de auth, config
      await Promise.all([
        Font.loadAsync(customFonts),
        checkAuthStatus(),
      ]);
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  if (!isReady) return null;
  return <Stack />;
}
```

---

## Optimización de Animaciones

Las animaciones deben correr a 60fps (16.6ms por frame). Si tu animación corre en el hilo de JS, compite con la lógica de la app y produce jank.

### Reanimated Worklets — Siempre en el Hilo Nativo

```typescript
// ✅ CORRECTO — la animación corre en el hilo de UI (worklet), no bloquea JS
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

function AnimatedCard() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <Card />
      </Pressable>
    </Animated.View>
  );
}
```

```typescript
// ❌ INCORRECTO — Animated de React Native corre en JS thread
import { Animated } from 'react-native';  // ← Nunca para animaciones de interacción

// ❌ INCORRECTO — useAnimatedStyle con lógica pesada
const style = useAnimatedStyle(() => {
  // No hagas cálculos costosos dentro de worklets — se ejecutan cada frame
  const result = heavyCalculation(someValue.value);
  return { transform: [{ translateX: result }] };
});
```

### Reglas de Animación Performante

| Hacer | No hacer |
|-------|----------|
| Animar `transform` y `opacity` (GPU) | Animar `width`, `height`, `margin` (layout recalc) |
| Usar `withSpring`/`withTiming` | Usar `setTimeout`/`setInterval` para animar |
| Animar con `useSharedValue` | Animar con `useState` (re-render cada frame) |
| Usar `useAnimatedStyle` | Pasar estilos animated por inline style objects |
| `cancelAnimation()` al desmontar | Dejar animaciones huérfanas que corren en background |

---

## Re-renders — Detección y Prevención

### Herramientas de Detección

```typescript
// Alternativa programática para detectar re-renders innecesarios:
if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, { trackAllPureComponents: true });
}
```

### Patrones Comunes de Re-render Innecesario

```typescript
// ❌ Problema: Context Provider con value nuevo cada render
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  // Este objeto se crea nuevo cada render → todos los consumers re-renderizan
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Solución: useMemo en el value del Provider
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

```typescript
// ❌ Problema: Estado alto que re-renderiza todo el árbol
function MatchScreen() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Cada keystroke en search re-renderiza MatchList, FilterBar, y Header

  return (
    <>
      <Header />
      <FilterBar filter={filter} onFilterChange={setFilter} />
      <SearchInput value={searchQuery} onChangeText={setSearchQuery} />
      <MatchList filter={filter} search={searchQuery} />
    </>
  );
}

// ✅ Solución: Aislar estado en el componente que lo necesita
function MatchScreen() {
  const [filter, setFilter] = useState('all');
  return (
    <>
      <Header />
      <FilterBar filter={filter} onFilterChange={setFilter} />
      <SearchableMatchList filter={filter} />  {/* searchQuery vive aquí dentro */}
    </>
  );
}
```

---

## Storage — MMKV vs AsyncStorage

| Aspecto         | AsyncStorage              | MMKV                            |
| --------------- | ------------------------- | ------------------------------- |
| Velocidad       | ~3ms por operación        | ~0.03ms por operación (100x)    |
| API             | Async (Promise)           | Sync + Async                    |
| Capacidad       | ~6MB en Android           | Sin límite práctico             |
| Encriptación    | No nativa                 | Sí (AES-256)                    |
| Uso recomendado | Legacy, apps muy simples  | Tokens, preferencias, caché     |

```typescript
// shared/infrastructure/storage/secure-storage.ts
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'app-storage', encryptionKey: 'your-key' });

export const secureStorage = {
  get: (key: string) => storage.getString(key) ?? null,
  set: (key: string, value: string) => storage.set(key, value),
  remove: (key: string) => storage.delete(key),
  contains: (key: string) => storage.contains(key),
} as const;
```
