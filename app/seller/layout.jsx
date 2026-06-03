"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Package, ShoppingCart, ClipboardList, LogOut, Menu } from "lucide-react";
import { CartProvider } from "@/components/seller/cart-context";

const navItems = [
  { href: "/seller/catalog", label: "Catalog", icon: Package },
  { href: "/seller/cart", label: "Cart", icon: ShoppingCart },
  { href: "/seller/orders", label: "My Orders", icon: ClipboardList },
];

function SidebarContent({ pathname, onNavigate }) {
  return (
    <>
      <div className="p-6 border-b">
        <h1 className="text-lg font-bold">Seller Portal</h1>
        <p className="text-sm text-muted-foreground">Browse &amp; Order</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );
}

export default function SellerLayout({ children }) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 bg-card border-r flex-col">
          <SidebarContent pathname={pathname} onNavigate={() => {}} />
        </aside>

        <div className="flex-1 flex flex-col">
          {/* Mobile header */}
          <header className="md:hidden flex items-center gap-3 p-4 border-b bg-card">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 flex flex-col">
                <SidebarContent
                  pathname={pathname}
                  onNavigate={() => setSheetOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold">Seller Portal</h1>
          </header>

          <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </CartProvider>
  );
}
