import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coy — Discover',
  description: 'Find out if your crush likes you back with Coy Discover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="antialiased min-h-screen bg-[#FDFBF7] flex justify-center">
        <div className="w-full max-w-md min-h-screen flex flex-col bg-white border-x border-gray-200 shadow-xl relative overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
