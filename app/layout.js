import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { Space_Grotesk, Inter } from 'next/font/google';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  metadataBase: new URL('https://zona-gamer-tau.vercel.app'),
  title: 'Zona Gamer | Tienda gamer en Bolivia',
  openGraph: {
    title: 'Zona Gamer | Sillas y sillones gamer originales',
    description: 'Cougar y Sharkoon. Elige tu silla y pídela por WhatsApp.',
    url: '/',
    siteName: 'Zona Gamer',
    locale: 'es_BO',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Zona Gamer' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
  description: 'Sillas y sillones gamer originales Cougar y Sharkoon. Pide por WhatsApp.',
};

export const viewport = { themeColor: '#060c16' };

const themeScript = `try{var t=localStorage.getItem('zg-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-body">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
