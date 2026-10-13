import './globals.css';
import { Space_Grotesk, Inter } from 'next/font/google';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'Zona Gamer | Tienda gamer en Bolivia',
  description: 'Sillas y sillones gamer originales Cougar y Sharkoon. Pide por WhatsApp.',
};

export const viewport = { themeColor: '#060c16' };

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
