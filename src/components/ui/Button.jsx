// src/components/ui/Button.jsx
"use client";
import TransitionLink from "@/components/TransitionLink";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[3px] text-[11px] font-bold uppercase tracking-[0.24em] px-8 py-4 select-none cursor-pointer transition-[transform,background-color,border-color,color] duration-[160ms] ease-cut active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

const variants = {
  primary:
    "bg-ink text-bg-main hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
  ghost:
    "border border-ink/20 text-ink hover:border-ink/50 hover:bg-ink/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
  thread:
    "relative text-ink after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-ink after:transition-[width] after:duration-300 after:ease-cut hover:after:w-full",
};

export default function Button({
  variant = "primary",
  href,
  type,
  disabled,
  className = "",
  children,
  ...props
}) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <TransitionLink href={href} className={cls} {...props}>
        {children}
      </TransitionLink>
    );
  }

  return (
    <button type={type ?? "button"} disabled={disabled} className={cls} {...props}>
      {children}
    </button>
  );
}