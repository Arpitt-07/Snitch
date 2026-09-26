import "./globals.css";
import { Archivo } from "next/font/google";
import { AppProvider } from '@/contexts/AppProvider'
import { TransitionProvider } from "@/components/TransitionProvider";
import Navbar from "@/components/layout/Navbar";
import PreloaderWithSignal from "@/components/PreloaderWithSignal";
import CustomCursor from "@/components/ui/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import { TransitionContent } from "@/components/TransitionProvider";
import FooterWrapper from "@/components/layout/FooterWrapper";

export const metadata = {
  title: "Snitch",
  description: "Streetwear that speaks for itself.",
};

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "900"],
  variable: "--font-archivo",
});

export default async function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable}`} suppressHydrationWarning={true}>
      <body className="antialiased">
        <AppProvider initialUser={null}>
          <TransitionProvider>
            <Navbar />
            <TransitionContent>
              <SmoothScroll>
                <PreloaderWithSignal />
                <CustomCursor />
                {children}
                <FooterWrapper />
              </SmoothScroll>
            </TransitionContent>
          </TransitionProvider>
        </AppProvider>
      </body>
    </html>
  );
}