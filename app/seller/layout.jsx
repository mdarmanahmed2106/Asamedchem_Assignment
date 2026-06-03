"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Package, ShoppingCart, ClipboardList, LogOut, Menu, User } from "lucide-react";
import { CartProvider, useCart } from "@/components/seller/cart-context";

const navItems = [
  { href: "/seller/catalog", label: "Catalog Grid", icon: Package },
  { href: "/seller/cart", label: "My Cart", icon: ShoppingCart },
  { href: "/seller/orders", label: "Order History", icon: ClipboardList },
];

function SidebarContent({ pathname, onNavigate }) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "S";
  const { items } = useCart();
  const cartCount = items.length;

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-6 border-b flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center border border-foreground bg-foreground text-background font-bold text-sm tracking-tighter">
          AM
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight uppercase">AsaMedChem</h1>
          <div className="inline-flex items-center gap-1 rounded-none border border-foreground/20 px-1.5 py-0.25 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mt-0.5">
            <User className="h-2.5 w-2.5" /> Seller Portal
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          const isCart = item.href === "/seller/cart";
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-sm text-xs font-medium uppercase tracking-wider transition-all",
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-none border border-black dark:border-white"
                  : "text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
              {isCart && cartCount > 0 && (
                <span className={cn(
                  "flex h-4 min-w-[16px] items-center justify-center rounded-full px-1.5 text-[9px] font-bold border",
                  isActive
                    ? "bg-white text-black border-white"
                    : "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                )}>
                  {cartCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-neutral-100 dark:bg-neutral-900 font-bold text-xs uppercase text-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SellerLayout({ children }) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  function getPageTitle() {
    if (pathname.startsWith("/seller/catalog")) return "Catalog Grid";
    if (pathname.startsWith("/seller/cart")) return "My Cart";
    if (pathname.startsWith("/seller/orders")) return "Order History";
    return "Seller Portal";
  }

  return (
    <CartProvider>
      <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col">
          <SidebarContent pathname={pathname} onNavigate={() => {}} />
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar (Unified for Desktop and Mobile) */}
          <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile menu trigger */}
              <div className="md:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-sm">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0 flex flex-col">
                    <SidebarContent
                      pathname={pathname}
                      onNavigate={() => setSheetOpen(false)}
                    />
                  </SheetContent>
                </Sheet>
              </div>
              
              {/* Breadcrumb / Title */}
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                {getPageTitle()}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground bg-neutral-100 dark:bg-neutral-900 border px-1.5 py-0.5 rounded-sm">
                    {user.role}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-sm text-xs uppercase tracking-wider gap-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 border-border"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content Pane */}
          <main className="flex-1 p-6 md:p-10 overflow-auto">
            <div className="max-w-7xl mx-auto w-full bg-background border border-border p-6 md:p-8 rounded-sm min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
