"use client";

import Image from "next/image";
import { useState } from "react";

interface BrandLogoProps {
  className?: string;
  badge?: boolean;
}

export function BrandLogo({
  className = "",
  badge = false,
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <span
      className={`brand-logo${badge ? " brand-logo--badge" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      <Image
        src="/brand/logo-transparent.png"
        alt=""
        width={101}
        height={88}
        sizes="101px"
        className="h-full w-auto object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
