import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo.png"
        alt=""
        width={32}
        height={32}
        priority
        className="size-8 drop-shadow-[0_0_10px_rgba(61,255,120,0.35)] transition group-hover:scale-105"
      />
      <span className="font-display text-[17px] font-semibold tracking-tight">
        KamKar<span className="text-primary">OAI</span>
      </span>
    </Link>
  );
}
