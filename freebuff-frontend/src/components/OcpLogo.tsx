"use client";

import Image from "next/image";

const PRESET_SIZES = {
  sm: "44px", // collapsed sidebar
  md: "180px", // expanded sidebar
  lg: "300px", // landing hero
} as const;

export type OcpLogoSize = keyof typeof PRESET_SIZES | (string & {});

export default function OcpLogo({
  size = "md",
  glass = true,
  className = "",
}: {
  size?: OcpLogoSize;
  glass?: boolean;
  className?: string;
}) {
  const width =
    size in PRESET_SIZES
      ? PRESET_SIZES[size as keyof typeof PRESET_SIZES]
      : size;

  const image = (
    <Image
      src="/assets/logos/ocp-eguide.png"
      alt="OCP eGuide"
      width={311}
      height={79}
      style={{ width, height: "auto", maxWidth: "100%" }}
      className={`object-contain ${className}`}
      priority
    />
  );

  if (!glass) return image;

  return (
    <div className="inline-flex items-center justify-center rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 px-2.5 py-1.5 whitespace-nowrap select-none transition-all duration-300 hover:bg-white/[0.09] hover:brightness-110 hover:shadow-[0_0_26px_rgba(0,160,80,0.22)]">
      {image}
    </div>
  );
}
