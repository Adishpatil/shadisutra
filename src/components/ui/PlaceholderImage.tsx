import Image from "next/image";

interface PlaceholderImageProps {
  /** Alt text for the image */
  alt: string;
  /** Aspect ratio as width/height (e.g. 16/9, 4/3, 1). Used for sizing. */
  aspectRatio?: number;
  /** Width in pixels (for layout) */
  width?: number;
  /** Height in pixels (for layout) */
  height?: number;
  /** Optional real image src — if the file exists, show it instead of the placeholder */
  src?: string;
  /** Additional CSS classes */
  className?: string;
  /** Fill mode (ignores width/height, fills parent container) */
  fill?: boolean;
  /** Priority loading */
  priority?: boolean;
  /** Sizes hint for responsive images */
  sizes?: string;
}

/**
 * Shows a real image if `src` is provided, otherwise renders a styled
 * placeholder block that maintains the correct aspect ratio.
 *
 * This allows the layout to be finalized before real images are added.
 */
export function PlaceholderImage({
  alt,
  aspectRatio,
  width = 800,
  height,
  src,
  className = "",
  fill = false,
  priority = false,
  sizes,
}: PlaceholderImageProps) {
  const computedHeight = height ?? (aspectRatio ? Math.round(width / aspectRatio) : width);

  // If a real src is provided, use next/image
  if (src) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-cover ${className}`}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={computedHeight}
        priority={priority}
        sizes={sizes}
        className={`object-cover ${className}`}
      />
    );
  }

  // Placeholder block
  if (fill) {
    return (
      <div
        className={`image-placeholder absolute inset-0 ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="relative z-10 text-center px-4 text-ink-muted text-sm">
          {alt || "Image placeholder"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`image-placeholder rounded-radius-md ${className}`}
      style={{ aspectRatio: `${width} / ${computedHeight}` }}
      role="img"
      aria-label={alt}
    >
      <span className="relative z-10 text-center px-4 text-ink-muted text-sm">
        {alt || "Image placeholder"}
      </span>
    </div>
  );
}
