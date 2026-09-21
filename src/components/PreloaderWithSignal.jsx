// small wrapper so Preloader can reach the context — src/components/PreloaderWithSignal.jsx
"use client";
import Preloader from "@/components/layout/Preloader";
import { useAppReady } from "@/contexts/AppReadyContext";

export default function PreloaderWithSignal() {
    const { setReady } = useAppReady();
    return <Preloader onLoaded={() => setReady(true)} />;
}