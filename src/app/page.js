"use client";
import Hero from "@/components/layout/Hero";
import BrandStatement from "@/components/layout/BrandStatement";
import ShopByDepartment from "@/components/layout/ShopByDepartment";
import JournalTeaser from "@/components/layout/JournalTeaser";
import CollectionSection from "@/components/layout/CollectionSection"; 

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-main">
            <Hero />
            <BrandStatement />
            <ShopByDepartment />
            <JournalTeaser />
            <CollectionSection />
        </main>
    );
}