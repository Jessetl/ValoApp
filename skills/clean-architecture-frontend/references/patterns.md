# Patrones de Arquitectura — Referencia

Patrones compartidos, integración con Expo Router, flujo de datos end-to-end y manejo de estado. Lee esta referencia cuando necesites entender cómo se conectan las piezas entre sí.

## Tabla de Contenidos

1. [Shared — Infraestructura Compartida](#shared--infraestructura-compartida)
2. [Integración con Expo Router](#integración-con-expo-router)
3. [Flujo Completo de un Request](#flujo-completo-de-un-request)
4. [Patrones de Manejo de Estado](#patrones-de-manejo-de-estado)

---

## Shared — Infraestructura Compartida

### API Client

```typescript
// shared/infrastructure/api/api-client.ts

import axios from 'axios';
import { env } from '@/config/env';
import { setupAuthInterceptor } from './interceptors/auth.interceptor';
import { setupErrorInterceptor } from './interceptors/error.interceptor';

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupAuthInterceptor(apiClient);
setupErrorInterceptor(apiClient);
```

### Result Type

Para operaciones que pueden fallar de forma controlada, usa `Result<T, E>` en lugar de throw/catch descontrolado:

```typescript
// shared/domain/types/result.type.ts

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export const Result = {
  ok: <T>(data: T): Result<T, never> => ({ success: true, data }),
  fail: <E>(error: E): Result<never, E> => ({ success: false, error }),
} as const;
```

---

## Integración con Expo Router

Las screens viven en la page pero Expo Router requiere archivos en `app/`. La solución es que los archivos de `app/` sean **re-exports** de las screens de la page:

```typescript
// app/index.tsx
export { default } from '@/app/pages/home/presentation/screens/home.screen';
```

```typescript
// app/auth/login.tsx
export { default } from '@/app/pages/auth/presentation/screens/login.screen';
```

**Regla:** los archivos de `app/` son thin wrappers (1-3 líneas). Toda la lógica, hooks y componentes viven en `app/pages/`.

---

## Flujo Completo de un Request

Para entender cómo se conectan todas las capas, este es el viaje de un login desde que el usuario toca el botón hasta que ve el resultado:

```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│   UI Touch   │───▶│  useLogin()  │───▶│ LoginUseCase  │───▶│  AuthRepo    │
│  (Button)    │    │  (Hook)      │    │  .execute()   │    │  .login()    │
└─────────────┘    └──────────────┘    └───────────────┘    └──────┬───────┘
                                                                    │
                          ┌──────────────┐    ┌──────────────────┐  │
                          │  AuthLocal   │◀───│   AuthRepoImpl   │◀─┘
                          │  .saveTokens │    │   (coordina)     │
                          └──────────────┘    └────────┬─────────┘
                                                       │
                                              ┌────────▼─────────┐
                                              │   AuthAPI         │
                                              │   .login()        │
                                              │   (Axios POST)    │
                                              └──────────────────┘
```

1. **UI** → El usuario toca "Iniciar sesión"
2. **Hook** → `useLogin().mutate(credentials)` dispara el TanStack Mutation
3. **Use Case** → `LoginUseCase.execute()` valida input con Zod, llama al repositorio
4. **Repository** → `AuthRepositoryImpl.login()` coordina entre API y Local datasources
5. **API Datasource** → `AuthApiDatasource.login()` hace el POST con Axios
6. **Local Datasource** → `AuthLocalDatasource.saveTokens()` persiste los tokens
7. **Mapper** → `UserMapper.fromLoginResponse()` transforma el DTO en Entity
8. **Hook** → TanStack Query actualiza el estado → React re-renderiza la UI

---

## Patrones de Manejo de Estado

### Estado del Servidor — TanStack Query

Para datos que vienen del servidor (listas, perfiles, configuraciones), usa TanStack Query. El caché, refetch, y sincronización los maneja la librería.

```typescript
// app/pages/matches/presentation/hooks/use-matches.ts

import { useQuery } from '@tanstack/react-query';
import { GetMatchesUseCase } from '../../application/use-cases/get-matches.use-case';

// ... composición de dependencias

export function useMatches(filters?: MatchFilters) {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: () => getMatchesUseCase.execute(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

### Estado del Cliente — Zustand

Para estado que NO viene del servidor (UI state, preferencias, estado de navegación), usa Zustand con slices por page.

```typescript
// app/pages/auth/presentation/store/auth.store.ts

import { create } from 'zustand';
import type { User } from '../../domain/entities/user.entity';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
```

### Cuándo Usar Cada Herramienta

| Dato                         | Herramienta     | Por qué                                    |
| ---------------------------- | --------------- | ------------------------------------------ |
| Lista de partidos del server | TanStack Query  | Es estado del servidor, necesita caché     |
| Usuario autenticado          | Zustand + Query | Se necesita globalmente y se sincroniza    |
| Modal abierto/cerrado        | Zustand o local | Es estado de UI, no viene del servidor     |
| Formulario en progreso       | React Hook Form | Es estado de formulario, local al form     |
| Token de autenticación       | SecureStorage   | Persiste entre sesiones, no es React state |
