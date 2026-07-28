import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// En GitHub Pages el sitio se sirve bajo /soter-hseq. En local queda vacío
// para que `npm run dev` siga funcionando en http://localhost:3000 sin prefijo.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exportación estática: GitHub Pages solo sirve archivos.
  output: "export",
  basePath,
  // Genera una carpeta con index.html por ruta, para que los enlaces
  // directos (/es/login/) resuelvan sin un servidor que reescriba.
  trailingSlash: true,
  // No hay servidor que optimice imágenes en Pages.
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
