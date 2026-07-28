# SOTER HSEQ — MVP

Plataforma web de Gestión Integral HSEQ & SST.

## Quick Start

```bash
cd soter-hseq
npm install
npm run dev
# Abre http://localhost:3000/es
```

> En desarrollo la ruta raíz `/` no redirige: entra por `/es` o `/en`.
> El redirect de la raíz lo resuelve `public/index.html`, que solo aplica
> al sitio publicado.

## Tecnologías

- **Next.js 14** — App Router, TypeScript estricto
- **Tailwind CSS** — diseño responsivo
- **Zustand** — estado global persistido
- **next-intl** — i18n vía `/es` y `/en` (montado, aún sin usar — ver abajo)
- **localStorage** — datos de demo (sin backend)

## Datos del demo

La semilla de `seed-data.ts` está escrita sobre una línea de tiempo fija
(julio de 2024). Publicada tal cual envejecería: "Visitas Hoy" en cero y
"Próximas Visitas" vacío para siempre.

Dos módulos lo evitan, y se aplican al sembrar en [`storage.ts`](src/lib/storage.ts):

- [`demo-timeline.ts`](src/lib/demo-timeline.ts) desplaza **toda** la línea de
  tiempo para que el "hoy" de la semilla caiga en el día real. Al mover todas
  las fechas el mismo número de días, las relaciones entre ellas (creada →
  programada → completada) se conservan. También renumera el año dentro de los
  códigos, que por llevar prefijo no son fechas y no se desplazan solos.
- [`demo-orders.ts`](src/lib/demo-orders.ts) agrega órdenes con una
  distribución deliberada por servicio. Las 7 escritas a mano usan 7 servicios
  distintos con una orden cada uno: sin esto, "servicios más solicitados" es un
  empate a 7 bandas y todas las barras salen al 100%.

Al cambiar la semilla hay que subir `STORAGE_VERSION` en `storage.ts`, o quien
ya visitó el demo se queda con los datos viejos en su localStorage.

## Gráficas

Barras horizontales en HTML ([`bar-list.tsx`](src/components/ui/bar-list.tsx)),
no una librería de charts. Reglas que sigue el componente:

- **Una serie, un color.** Las barras de "servicios más solicitados" comparten
  color: la longitud ya codifica la magnitud, y teñir por valor gastaría el
  canal de identidad repitiendo lo que la barra dice.
- **El color sigue al estado, no a la posición.** En "órdenes por estado" cada
  estado conserva su color aunque cambie el orden o el conteo.
- **El color nunca informa solo.** Cada fila lleva etiqueta y valor visibles.

Los colores de estado están validados contra la superficie blanca de las
tarjetas: todos ≥3:1 de contraste, y el peor par adyacente (ámbar/verde) a
ΔE 7.3 bajo deuteranopía.

## Arquitectura

```
src/
├── app/[locale]/          # Next.js App Router + rutas por idioma
│   ├── login/             # Selector de perfil demo
│   ├── admin/             # Dashboard, Clientes, Órdenes, Técnicos, Agenda, Cotizaciones
│   ├── tecnico/           # Mis Órdenes, Mi Agenda
│   └── cliente/           # Portal, Cotizaciones
├── components/
│   ├── ui/                # Badge, Button, Card, Input, Modal, Progress, Avatar
│   └── layout/            # Sidebar, Header, AppLayout (auth guard)
├── store/
│   ├── auth-store.ts      # Zustand + persist (rol activo)
│   └── data-store.ts      # Zustand + localStorage (todos los datos)
├── lib/
│   ├── seed-data.ts       # Datos demo (5 clientes, 8 servicios, 7 órdenes…)
│   ├── storage.ts         # Abstracción de localStorage
│   └── utils.ts           # Formatters, configs de estado/prioridad
├── types/index.ts         # Tipos TypeScript centrales
└── i18n/                  # Configuración next-intl
messages/
├── es.json                # Todas las cadenas en español
└── en.json                # All strings in English
```

## Roles y acceso

| Rol           | Acceso                                              | Demo user         |
|---------------|-----------------------------------------------------|-------------------|
| Administrador | Todo: clientes, órdenes, técnicos, agenda, KPIs     | Carlos Méndez     |
| Coordinador   | Igual al admin                                      | Luisa Fernández   |
| Técnico       | Solo sus órdenes asignadas + agenda personal        | Andrés Morales    |
| Cliente       | Portal de consulta + cotizaciones                   | María Torres      |

## Módulos del MVP

1. **Login Demo** — selector de perfil con 4 roles
2. **Dashboard Admin** — KPIs, gráficas (pie + barras), órdenes recientes, próximas visitas
3. **Clientes** — CRUD, filtros, detalle con contactos/sedes/historial
4. **Órdenes de Trabajo** — tabla filtrable, detalle completo, cambio de estado, avance, evidencias, historial de actividad
5. **Técnicos** — CRUD, detalle con órdenes activas
6. **Agenda** — calendario mensual + lista de próximas visitas
7. **Cotizaciones** — tabla con detalles, flujo de aprobación
8. **Portal Técnico** — vista personal de órdenes + registro de avance
9. **Portal Cliente** — estado de servicios, visitas, historial

## Despliegue (GitHub Pages)

El sitio es una **exportación estática** (`output: "export"`), sin backend.
Cada push a `main` dispara [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
que compila y publica en Pages.

```bash
# Reproducir el build de producción en local
NEXT_PUBLIC_BASE_PATH=/soter-hseq npm run build
npx serve out   # o cualquier servidor estático
```

`NEXT_PUBLIC_BASE_PATH` existe porque Pages sirve el sitio bajo `/soter-hseq`.
En local se deja vacío para que `npm run dev` funcione sin prefijo.

Consecuencias de ser estático: no hay middleware (el redirect de la raíz vive en
`public/index.html`), y `public/.nojekyll` es obligatorio o Pages ignora `_next/`.

## Cambiar idioma — pendiente

⚠️ La infraestructura i18n está montada (rutas `/es` y `/en`, `next-intl`
cargando `messages/es.json` y `messages/en.json`), pero **ningún componente
consume las traducciones todavía**: no hay una sola llamada a `useTranslations`.
Todos los textos de la interfaz están escritos en español directamente en el
JSX, así que `/en/...` renderiza la misma UI en español.

Para completarlo hay que reemplazar las cadenas literales por `t("clave")` en
las páginas y en `components/layout/`.

## Restablecer datos demo

Clic en "Restablecer demo" en la parte inferior del sidebar.
