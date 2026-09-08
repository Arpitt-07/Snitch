"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Preloader() {
  const container = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(true);

  useGSAP(() => {
    // Lock scrolling during the sequence
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "auto";
        setIsMounted(false); // Remove from DOM when finished
      }
    });

    // 1. Text fades in and moves up slightly
    tl.fromTo(textRef.current, 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
    // 2. Hold, then fade text out
    .to(textRef.current, {
      opacity: 0,
      y: -15,
      duration: 0.4,
      delay: 0.8, // The duration it stays visible
      ease: "power2.in"
    })
    // 3. The cinematic curtain sweep upward
    .to(container.current, {
      yPercent: -100,
      duration: 0.8,
      ease: "power4.inOut"
    });
  }, { scope: container });

  // Do not render anything once the animation is complete
  if (!isMounted) return null;

  return (
    <div 
      ref={container} 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950"
    >
      <div 
        ref={textRef} 
        className="text-neutral-300 text-xs tracking-[0.4em] uppercase font-light opacity-0"
      >
        Loading Experience
      </div>
    </div>
  );
}