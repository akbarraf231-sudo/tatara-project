import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cartContext";
import { Navbar } from "@/components/Navbar";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SplashScreen } from "@/components/SplashScreen";
import { supabaseServer } from "@/lib/supabaseServer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sinar Jaya Bakery",
  description: "Premium bakery products",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function loadSettings() {
  try {
    const { data } = await supabaseServer
      .from('settings')
      .select('site_logo_url, cs_whatsapp_number, whatsapp_number')
      .limit(1)
      .maybeSingle();
    return data || {};
  } catch {
    return {};
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await loadSettings();
  const logoUrl = (settings as { site_logo_url?: string }).site_logo_url || '';
  const waNumber =
    (settings as { cs_whatsapp_number?: string }).cs_whatsapp_number ||
    (settings as { whatsapp_number?: string }).whatsapp_number ||
    '';

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fce8e2]">
        <SplashScreen initialLogoUrl={logoUrl} />
        <CartProvider>
          <Navbar initialLogoUrl={logoUrl} />
          {children}
          <FloatingWhatsApp initialWaNumber={waNumber} />
        </CartProvider>
      </body>
    </html>
  );
}
