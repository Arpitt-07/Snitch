// src/components/layout/Hero.jsx
"use client";
import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppReady } from "@/contexts/AppReadyContext";
import { useCursor } from "@/contexts/CursorContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import TransitionLink from "@/components/TransitionLink";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const headlineRef = useRef(null);
  const eyebrowRef = useRef(null);
  const copyRef = useRef(null);
  const ctaRef = useRef(null);
  const { ready } = useAppReady();
  const { setVariant } = useCursor();
  const reduce = useReducedMotion();
  useGSAP(
    () => {
      if (!ready) return;

      const lineSplit = new SplitText(headlineRef.current, {
        type: "lines",
        linesClass: "overflow-hidden",
      });

      const charSplit = new SplitText(headlineRef.current, {
        type: "chars",
      });

      const lines = lineSplit.lines;
      const chars = charSplit.chars;

      const weights = [900, 400, 200, 200, 400, 800];

      const tl = gsap.timeline({
        delay: 0.2,
        defaults: { ease: "expo.out" }
      });

      if (!reduce) {
        tl.fromTo(
          imageRef.current,
          { scale: 1.15, opacity: 0.6 },
          { scale: 1, opacity: 1, duration: 2.2, ease: "power2.out" },
          0
        );

        lines.forEach((line, i) => {
          const fromY = i % 2 === 0 ? -110 : 110;
          tl.fromTo(
            line,
            { yPercent: fromY, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.1 },
            0
          );
        });

        chars.forEach((char, i) => {
          const targetWeight = weights[i] || 900;
          tl.fromTo(
            char,
            { fontVariationSettings: "'wght' 100" },
            { fontVariationSettings: `'wght' ${targetWeight}`, duration: 1.5 },
            0
          );
        });

        tl.fromTo(
          eyebrowRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.5
        );

        tl.fromTo(
          copyRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.8 },
          0.65
        );

        tl.fromTo(
          ctaRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          0.85
        );
        gsap.to(imageRef.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      } else {
        tl.fromTo([imageRef.current, headlineRef.current, eyebrowRef.current, copyRef.current, ctaRef.current],
          { opacity: 0 },
          { opacity: 1, stagger: 0.2, duration: 0.8 }
        );
      }

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === containerRef.current) st.kill();
        });
      };
    },
    { dependencies: [ready, reduce] }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-ink text-bg-main"
      style={{ paddingTop: "var(--nav-height)" }}
    >
      <img
        ref={imageRef}
        src="https://images.pexels.com/photos/38264826/pexels-photo-38264826.jpeg"
        alt=""
        className="hidden md:block absolute inset-0 w-full h-[120%] object-cover"
      />

      <img
        src="https://images.pexels.com/photos/33875527/pexels-photo-33875527.jpeg"
        alt=""
        className="block md:hidden absolute inset-0 w-full h-[120%] object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      <div className="absolute inset-0 z-10 h-full w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pb-20 md:pb-24 flex flex-col justify-end">

        <p
          ref={eyebrowRef}
          className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40 mb-4"
        >
          Collection 2026 / High-Contrast
        </p>

        <h1
          ref={headlineRef}
          className="text-[16vw] sm:text-[14vw] md:text-[12vw] lg:text-[11vw] font-black uppercase tracking-tighter leading-[0.85]"
          style={{ fontVariationSettings: "'wght' 900" }}
        >
          SNITCH
        </h1>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mt-8 gap-6">
          <p
            ref={copyRef}
            className="text-sm md:text-base max-w-sm leading-relaxed opacity-70 tracking-wide"
          >
            Premium x Streetwear. Precision-cut essentials designed
            for the urban landscape.
          </p>

          <div ref={ctaRef}>
            <TransitionLink
              href="/products"
              onMouseEnter={() => setVariant("view")}
              onMouseLeave={() => setVariant("default")}
              className="group relative inline-block border border-bg-main/20 text-bg-main text-[11px] font-bold uppercase tracking-[0.28em] px-10 py-4 transition-all duration-300 hover:bg-bg-main hover:text-ink active:scale-[0.97]"
            >
              <span className="relative z-10">Shop Collection</span>
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}