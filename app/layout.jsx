import './globals.css';
import { Providers } from './providers';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Leads',
  description: 'Filter and manage leads. Fetch from Google Places or add manually.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
