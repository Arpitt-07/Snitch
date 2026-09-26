"use client";
import Preloader from "@/components/layout/Preloader";
import { useAppReady } from "@/contexts/AppReadyContext";

export default function PreloaderWithSignal() {
    const { setReady } = useAppReady();
    return <Preloader onLoaded={() => setReady(true)} />;
}