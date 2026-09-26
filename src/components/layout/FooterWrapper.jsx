"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/register";
    return !isAuthPage ? <Footer /> : null;
}
