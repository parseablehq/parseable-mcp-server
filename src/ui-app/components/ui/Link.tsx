import type { AnchorHTMLAttributes } from "react";

export function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props} />;
}
