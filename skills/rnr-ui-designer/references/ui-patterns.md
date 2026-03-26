# Patrones de UI — Referencia

Patrones de animación, layouts de pantalla y componentes comunes con código completo. Lee esta referencia cuando necesites implementar animaciones, screens o componentes específicos.

## Tabla de Contenidos

1. [Microinteracciones y Animaciones](#microinteracciones-y-animaciones)
2. [Patrones de Pantalla Comunes](#patrones-de-pantalla-comunes)

---

## Microinteracciones y Animaciones

Usa `react-native-reanimated` para todas las animaciones. Prefiere `withSpring()` para interacciones del usuario y `withTiming()` para transiciones de estado.

### Entrada de elementos (Fade + Slide)

```tsx
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';

// Elementos que entran escalonados
{
  items.map((item, index) => (
    <Animated.View
      key={item.id}
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
    >
      <Card>...</Card>
    </Animated.View>
  ));
}
```

### Botón con feedback háptico

```tsx
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function AnimatedButton({ onPress, children }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Button
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {children}
      </Button>
    </Animated.View>
  );
}
```

### Skeleton loader (usando RNR)

```tsx
import { Skeleton } from '@/components/ui/skeleton';

function CardSkeleton() {
  return (
    <Card className='p-4 gap-3'>
      <Skeleton className='h-40 w-full rounded-xl' />
      <Skeleton className='h-5 w-3/4 rounded-md' />
      <Skeleton className='h-4 w-1/2 rounded-md' />
    </Card>
  );
}
```

### Transiciones de pantalla (con Expo Router)

```tsx
// app/_layout.tsx
<Stack
  screenOptions={{
    animation: 'slide_from_right',
    headerShown: false,
  }}
/>
```

### Cuándo Animar y Cuándo NO

| Animar                                | NO Animar                          |
| ------------------------------------- | ---------------------------------- |
| Entrada/salida de elementos en listas | Cambios de texto/números triviales |
| Feedback de press en botones          | Contenido que ya está en pantalla  |
| Transiciones entre pantallas          | Cada re-render de estado           |
| Apertura/cierre de modals/sheets      | Scroll normal (ya es nativo)       |
| Skeleton → contenido real             | Colores de fondo estáticos         |
| Expansión de acordeones               | Labels, badges estáticos           |
| Swipe actions                         | Íconos decorativos                 |

**Regla de oro:** anima para GUIAR al usuario, no para decorar. Si la animación no ayuda al usuario a entender qué pasó o qué puede hacer, quítala.

---

## Patrones de Pantalla Comunes

### Screen Layout Base

```tsx
function ScreenBase({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView className='flex-1 bg-background'>
      <ScrollView
        className='flex-1'
        contentContainerClassName='px-4 pt-6 pb-12 gap-6'
        showsVerticalScrollIndicator={false}
      >
        <Text className='text-2xl font-bold text-foreground'>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Formulario con RNR

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

function LoginForm() {
  return (
    <View className='gap-6'>
      <View className='gap-1.5'>
        <Label nativeID='email'>Correo electrónico</Label>
        <Input
          aria-labelledby='email'
          placeholder='tu@email.com'
          keyboardType='email-address'
          autoCapitalize='none'
          className='bg-background'
        />
      </View>

      <View className='gap-1.5'>
        <Label nativeID='password'>Contraseña</Label>
        <Input
          aria-labelledby='password'
          placeholder='••••••••'
          secureTextEntry
          className='bg-background'
        />
      </View>

      <Button className='w-full'>
        <Text className='text-primary-foreground font-semibold'>
          Iniciar sesión
        </Text>
      </Button>
    </View>
  );
}
```

### Card de Producto

```tsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

function ProductCard({ product }) {
  return (
    <Card className='overflow-hidden'>
      <Image
        source={{ uri: product.image }}
        className='h-48 w-full'
        resizeMode='cover'
        accessibilityLabel={product.name}
      />
      <CardHeader className='pb-2'>
        <View className='flex-row items-center justify-between'>
          <Text className='text-lg font-semibold text-card-foreground'>
            {product.name}
          </Text>
          <Badge variant={product.inStock ? 'default' : 'destructive'}>
            <Text>{product.inStock ? 'Disponible' : 'Agotado'}</Text>
          </Badge>
        </View>
      </CardHeader>
      <CardContent>
        <Text className='text-sm text-muted-foreground' numberOfLines={2}>
          {product.description}
        </Text>
      </CardContent>
      <CardFooter className='flex-row items-center justify-between'>
        <Text className='text-xl font-bold text-foreground'>
          ${product.price}
        </Text>
        <Button size='sm'>
          <Text className='text-primary-foreground text-sm'>Agregar</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}
```
