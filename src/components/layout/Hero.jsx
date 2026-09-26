"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useAppReady } from "@/contexts/AppReadyContext";
import { useCursor } from "@/contexts/CursorContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import TransitionLink from "@/components/TransitionLink";
import Button from "@/components/ui/Button";

gsap.registerPlugin(SplitText);

export default function Hero() {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const eyebrowRef = useRef(null);
  const copyRef = useRef(null);
  const ctaRef = useRef(null);

  const { ready } = useAppReady();
  const { setVariant } = useCursor();
  const reduce = useReducedMotion();

useGSAP(() => {
    const headsplit = SplitText.create(headlineRef.current, {
      type: "chars",
      mask: "chars",
    });
    const eyebrowSplit = SplitText.create(
      eyebrowRef.current.querySelectorAll(".eyebrow"),
      { type: "lines", mask: "lines" }
    );

    const chars = headsplit.chars;
    const lines = eyebrowSplit.lines;

    gsap.set(chars, { yPercent: 110,  });
    gsap.set(lines, { yPercent: 110, opacity: 0 });
    gsap.set(ctaRef.current, { y: 20, opacity: 0 });

    const tl = gsap.timeline({ delay: 0.5 });

    if (!reduce) {
      tl.to(chars, {
        yPercent: 0,
    
        stagger: { each: 0.07, from: "random" },
        ease: "expo.out",
        duration: 1.5,
      }).to(
        lines,
        {
          yPercent: 0,
          opacity: 1,
          stagger: { each: 0.07 },
          ease: "expo.out",
          duration: 1.2,
        },
        "-=1.2"
      ).to(
        ctaRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "expo.out",
        },
        "-=0.8"
      );
    }
}, [ready]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[100dvh] overflow-hidden text-white"
    >
      <Image
        src="https://images.pexels.com/photos/38264826/pexels-photo-38264826.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover hidden md:block "
      />
      <Image src="https://images.pexels.com/photos/38368968/pexels-photo-38368968.jpeg" alt="Logo" fill className="object-cover object-bottom  md:hidden " />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />


      <div className="relative z-10 min-h-[100dvh] w-full px-5 md:px-10 gap-[30rem] md:gap-0  flex flex-col md:justify-end justify-center transform translate-y-20 md:translate-y-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6  ">
          <div ref={eyebrowRef} className="w-full translate-y-52 md:translate-y-0  ">
            <p
              className="eyebrow text-base md:text-base uppercase overflow-hidden font-medium tracking-wider"
            >
              Essentials, sharpened
            </p>
            <p className="eyebrow text-sm md:text-base uppercase overflow-hidden opacity-80 text-start">
              Premium fabric, street instinct, zero compromise.
            </p>
          </div>

          <div ref={ctaRef} >
            <Button
              href="/products"
              variant="ghost"
              onMouseEnter={() => setVariant("view")}
              onMouseLeave={() => setVariant("default")}
              className='border-bg-main/20 text-bg-main hover:border-bg-main/50 hover:bg-bg-main/5 whitespace-nowrap '
            >
              SHOP Collection
            </Button>
          </div>
        </div>
        <h1
          ref={headlineRef}
          className="text-[20vw] md:text-[22vw] text-bg-main font-sans font-medium uppercase tracking-widest text-center  leading-none w-full"
        >
          SNITCH
        </h1>
      </div>
    </section>
  );
}