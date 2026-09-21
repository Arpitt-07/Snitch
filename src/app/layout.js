// src/app/layout.js
import "./globals.css";
import { AppProvider } from '@/contexts/AppProvider'
import { TransitionProvider } from "@/components/TransitionProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PreloaderWithSignal from "@/components/PreloaderWithSignal";
import CustomCursor from "@/components/ui/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import { archivo } from "./fonts";

export const metadata = {
  title: "Snitch",
  description: "Streetwear that speaks for itself.",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable}`} suppressHydrationWarning={true}>
      <body className="antialiased">
        <AppProvider initialUser={null}>
          <TransitionProvider>
            <Navbar />
            <SmoothScroll>
              <PreloaderWithSignal />
              <CustomCursor />
              {children}
              <Footer />
            </SmoothScroll>
          </TransitionProvider>
        </AppProvider>
      </body>
    </html>
  );
}
