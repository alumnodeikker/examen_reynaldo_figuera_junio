import "./globals.css";

export const metadata = {
  title: "Checkout Stripe",
  description: "Practica de pagos con Stripe y Supabase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
