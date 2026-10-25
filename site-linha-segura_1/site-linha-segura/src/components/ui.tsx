import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-[0.95rem] font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)] active:scale-[.98] disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-snow text-void hover:bg-white hover:shadow-[0_0_0_4px_rgb(0_212_255/.18),0_12px_40px_-12px_rgb(0_212_255/.6)]",
  secondary:
    "border border-steel/30 text-snow hover:border-cyan/70 hover:bg-cyan/[.06]",
  ghost: "text-steel hover:text-snow",
};

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
  external?: boolean;
} & Omit<ComponentProps<"a">, "href">;

export function ButtonLink({ href, variant = "primary", children, className = "", external, ...rest }: ButtonLinkProps) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (external || href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Badge({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "ok" | "warn" }) {
  const tones = {
    cyan: "border-cyan/30 bg-cyan/[.08] text-cyan",
    ok: "border-ok/30 bg-ok/[.08] text-ok",
    warn: "border-warn/30 bg-warn/[.08] text-warn",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
