# Flujo de trabajo del blog

Este documento describe cómo crear y publicar artículos en el blog de MotoGuía AR.

## Ubicación

Los artículos se publican en `/blog/` y están en `src/content/blog/`.

## Estructura de un artículo

Cada artículo es un archivo Markdown (`.md`) en `src/content/blog/` con este frontmatter:

```yaml
---
title: Título del artículo (máx. 60 caracteres recomendado)
description: Resumen breve del artículo (máx. 155 caracteres recomendado)
pubDate: 2026-10-15
updatedDate: 2026-10-20  # Opcional, para actualizaciones
author: Lautaro Diaz
heroImage:
  path: /images/blog/nombre-imagen.jpg  # Ruta absoluta o relativa a /images/blog/
  alt: Descripción de la imagen
  width: 1200  # Mínimo 1200px
  height: 675  # Proporción 16:9 requerida
sources:
  - name: ACARA - Estadísticas septiembre 2026
    url: https://www.acara.org.ar/estadisticas
  - name: Sitio oficial de Honda Argentina
    url: https://www.honda.com.ar/
tags:
  - ventas
  - honda
  - lanzamientos
relatedMotorcycles:
  - honda-xr300l-tornado
  - honda-cb125f-twister
status: published  # o 'draft'
indexable: true
seoTitle: Título SEO personalizado (opcional)
seoDescription: Descripción SEO personalizada (opcional)
---
```

## Campos obligatorios

- **title**: Título del artículo
- **description**: Resumen breve
- **pubDate**: Fecha de publicación (formato YYYY-MM-DD)
- **author**: Nombre del autor (actualmente solo "Lautaro Diaz")
- **heroImage**: Imagen principal con `path`, `alt`, `width` y `height`
  - Debe tener al menos 1200px de ancho
  - Debe mantener proporción 16:9 (ejemplo: 1200×675, 1600×900, 1920×1080)
- **status**: `published` o `draft`
- **indexable**: `true` o `false`

## Campos opcionales

- **updatedDate**: Fecha de última actualización
- **sources**: Array de fuentes con `name` y `url`
- **tags**: Array de etiquetas para categorizar
- **relatedMotorcycles**: Array de IDs de motos mencionadas (slug sin marca)
- **seoTitle**: Título personalizado para SEO (si difiere del `title`)
- **seoDescription**: Descripción personalizada para SEO

## Imágenes

### Imagen principal (hero)

- Colocar en `public/images/blog/`
- Formato recomendado: JPG o PNG
- Tamaño mínimo: 1200×675 px (16:9)
- Peso recomendado: < 200 KB
- El sistema la optimiza automáticamente a WebP

### Imágenes en el contenido

Usar rutas absolutas desde `/public/`:

```markdown
![Descripción](images/blog/imagen-contenido.jpg)
```

## Contenido del artículo

El cuerpo del artículo se escribe en Markdown estándar después del frontmatter:

```markdown
---
# frontmatter aquí
---

## Introducción

Texto del artículo...

### Subsección

Más contenido...
```

## Estructura recomendada

1. **Introducción**: Contexto y resumen del tema
2. **Desarrollo**: Datos, análisis, detalles
3. **Conclusión**: Cierre y puntos clave

## Validación

Antes de publicar, ejecutar:

```bash
npm run validate  # Valida el schema del contenido
npm run check     # Verifica tipos de TypeScript
npm test          # Ejecuta tests
npm run build     # Construcción completa
```

## Publicación

1. Crear el archivo `.md` en `src/content/blog/`
2. Añadir la imagen hero en `public/images/blog/`
3. Validar con `npm run validate`
4. Hacer commit y push
5. El artículo aparecerá en `/blog/` una vez desplegado

## SEO y metadatos

El sistema genera automáticamente:

- Meta tags Open Graph y Twitter Card
- JSON-LD NewsArticle con autor y fechas
- Canonical URL
- Imágenes optimizadas (WebP)
- RSS feed en `/blog/rss.xml`
- Inclusión en el sitemap

## Autor

Actualmente solo hay un autor configurado:

- **Lautaro Diaz**: `/autores/lautaro-diaz/`

Para añadir más autores, crear nuevas páginas en `src/pages/autores/`.

## Ejemplo completo

```markdown
---
title: Honda XR300L Tornado llega a Argentina
description: La nueva trail de Honda desembarca en el país con motor de 300cc y equipamiento off-road. Precio y características.
pubDate: 2026-10-15
author: Lautaro Diaz
heroImage:
  path: /images/blog/honda-xr300l-lanzamiento.jpg
  alt: Honda XR300L Tornado 2026 en Argentina
  width: 1200
  height: 675
sources:
  - name: Honda Argentina - Comunicado oficial
    url: https://www.honda.com.ar/prensa/xr300l
tags:
  - lanzamientos
  - honda
  - trail
relatedMotorcycles:
  - honda-xr300l-tornado
  - honda-xr190l
status: published
indexable: true
---

## Honda presenta la XR300L Tornado

Honda Argentina anunció el lanzamiento de la XR300L Tornado, su nueva trail de 300cc orientada al uso mixto on-road y off-road...

### Características principales

- Motor monocilíndrico de 300cc refrigerado por aire
- Suspensión de largo recorrido
- Freno de disco delantero

### Precio

El precio de lista sugerido es de $X.XXX.XXX...
```

## Notas

- No crear artículos de prueba o placeholder con contenido inventado
- Todas las fechas deben ser reales
- Las fuentes deben ser verificables
- Los datos deben provenir de fuentes oficiales
