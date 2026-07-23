import Image from "next/image";

export function Logo({ className = "text-lg" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] font-extrabold ${className}`}>
      <Image
        src="/logo-mark.png"
        alt=""
        width={40}
        height={40}
        className="h-[1.9em] w-[1.9em] shrink-0"
        priority
      />
      FORGE
    </span>
  );
}
