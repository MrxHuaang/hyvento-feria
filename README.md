# Hyvento · Míralo antes de pagarlo

Demo para la Décima Cuarta Feria de Emprendimiento (Visión de las Américas, 2026).
El visitante arma en vivo la página de su negocio, con su nombre, logo, color y letra,
y sale con una cotización simbólica.

## Qué tiene

- Carga y portada en estilo grabado, con una esfera armilar en 3D (Three.js).
- Editor en vivo con siete plantillas: restaurante, cafetería, tienda, barbería,
  consultorio, gimnasio y pastelería. Cada una con composición propia.
- Doce módulos que se instalan y se reordenan arrastrando.
- Cotización en "eurodólares", moneda inventada para la feria.

## Correr en local

```bash
npm install
npm run dev
```

## Stack

Vite, React, TypeScript, Tailwind CSS v4, GSAP (ScrollTrigger, Flip), Lenis y Three.js.

## Antes de usarla en serio

- `src/lib/config.ts`: cambia `WHATSAPP_NUMBER` por el número real.
- Las fotos de las plantillas se cargan desde Unsplash, así que hace falta internet.
