import type { HTMLAttributes } from "react";

type CardFrameProps = HTMLAttributes<HTMLDivElement>;

export function CardFrame({ children, className = "", ...props }: CardFrameProps) {
  return (
    <div className={`card-frame ${className}`} {...props}>
      <svg
        aria-hidden="true"
        className="card-frame-lines"
        viewBox="0 0 360 180"
        preserveAspectRatio="none"
      >
        <path pathLength="1" d="M16 174V92A164 86 0 0 1 344 92V174" />
        <path pathLength="1" d="M28 174V94A152 74 0 0 1 332 94V174" />
      </svg>
      <div className="card-frame-content">{children}</div>
    </div>
  );
}
