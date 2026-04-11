import { Link, useLocation } from "wouter";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps {
  href: string;
  className?: string;
  activeClassName?: string;
  children?: React.ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, href, children, ...props }, ref) => {
    const [location] = useLocation();
    const isActive = location === href;

    return (
      <Link href={href}>
        <a
          ref={ref}
          className={cn(className, isActive && activeClassName)}
          {...props}
        >
          {children}
        </a>
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
