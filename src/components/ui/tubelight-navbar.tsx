import React from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.url;

          return (
            <NavLink
              key={item.name}
              to={item.url}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-calm",
                "text-muted-foreground hover:text-foreground",
                isActive && "text-primary"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="tubelight-bar"
                  className="absolute -top-[1px] left-0 right-0 mx-auto h-[2px] w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative">
                <Icon size={20} strokeWidth={1.5} />
                {isActive && (
                  <motion.span
                    layoutId="tubelight"
                    className="absolute -inset-2 rounded-full bg-primary/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </span>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
