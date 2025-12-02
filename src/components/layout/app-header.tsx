import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/add-expense", label: "Add Expense", icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight hidden sm:block">
            Family Expenses
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                asChild
                className={cn(
                  "gap-2 transition-all",
                  isActive && "bg-secondary shadow-sm"
                )}
              >
                <Link to={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </Button>
            );
          })}
          <div className="ml-2 border-l border-border pl-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
