"use client";

import Image from "next/image";
import { useState } from "react";

interface BrandLogoProps {
  className?: string;
  dark?: boolean;
}

export function BrandLogo({ className = "", dark = false }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <span
      className={`brand-logo${dark ? " brand-logo--dark" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      <Image
        src="/brand/logo.png"
        alt=""
        width={112}
        height={74}
        sizes="72px"
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
