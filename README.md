# MotoGuía AR

Portal estático en español de Argentina para elegir una moto, comparar fichas y estimar el costo de usarla. No vende motos.

## Stack

- Astro 7.3.x, TypeScript 5.9.x, salida `static` → `dist/`
- Node 22.12 o superior (par)
- npm 10 o superior

## Comandos

```bash
npm ci
npm run dev
npm run check
npm run validate
npm test
npm run build
npm run preview
npm run launch-check
```

`npm run build` corre `astro check`, validación de contenido, tests y el build estático.

## Configuración

Copiá `.env.example`. El origen canónico es `SITE_URL`. La indexación exige `DEPLOYMENT_STAGE=production`, `PUBLIC_INDEXING_ENABLED=true` y un dominio real que no sea el placeholder. Ads y analytics quedan apagados hasta IDs reales.

`PUBLIC_CONTACT_EMAIL` vacío deja `/contacto/` sin formulario.

## Contenido

- Fichas: `src/content/motorcycles/`
- Ranking: `src/content/rankings/`
- Guías, comparativas y accesorios: `src/content/`
- Marcas y fuentes: `src/data/`

Un cambio de precio o de mes de ranking es una edición de datos y un rebuild. El sitio no se actualiza solo por ser 2026.

## Despliegue

Vercel, preset Astro, comando `npm run build`, salida `dist`. Sin adapter. Preview: `PUBLIC_INDEXING_ENABLED=false`. Ver `docs/DEPLOYMENT.md`.
