"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Box Office Tracker" },
  { href: "/discover", label: "Movie Discovery" },
];

export function Nav() {
  const pathname = usePathname();

  // Project21 is a standalone page reached only by direct link.
  if (pathname === "/project21") return null;

  return (
    <nav className="bg-surface border-b border-border px-6 py-2 flex gap-4">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
            pathname === href
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
