import './globals.css';

export const metadata = {
  title: 'Zona Gamer | Tienda gamer en Bolivia',
  description: 'Consolas, periféricos, juegos y accesorios. Pide por WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
