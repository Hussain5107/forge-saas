import Image from "next/image";

export function Logo({ className = "text-lg" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-extrabold ${className}`}>
      <Image src="/logo-mark.png" alt="" width={24} height={24} className="h-[1em] w-[1em]" />
      FORGE
    </span>
  );
}
