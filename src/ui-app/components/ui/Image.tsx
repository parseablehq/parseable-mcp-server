import type { ImgHTMLAttributes } from "react";

export function Image({ priority: _priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) {
  return <img {...props} />;
}
