"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Decimal from "decimal.js";
import { toBaseQty, calcLineTotal, calcDisplayPrice } from "@/lib/units";
import { useCart } from "@/components/seller/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateItemQty, clearCart } = useCart();
  const [units, setUnits] = useState([]);
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/units")
      .then((res) => res.json())
      .then(setUnits)
      .catch(console.error);
  }, []);

  function getUnit(unitId) {
    return units.find((u) => u.id === unitId);
  }

  function calcItemLineTotal(item) {
    const unit = getUnit(item.unitId);
    if (!unit) return new Decimal(0);

    const orderedQty = new Decimal(item.qty);
    const cf = new Decimal(unit.conversionFactor.toString());
    const baseQty = toBaseQty(orderedQty, cf);
    const pricePerBase = new Decimal(item.product.pricePerBaseUnit.toString());
    return calcLineTotal(baseQty, pricePerBase);
  }

  function formatItemPrice(item) {
    const unit = getUnit(item.unitId);
    if (!unit) return "—";
    const cf = new Decimal(unit.conversionFactor.toString());
    const basePrice = new Decimal(item.product.pricePerBaseUnit.toString());
    const displayPrice = calcDisplayPrice(basePrice, cf);
    return `₹${displayPrice.toFixed(2)}/${unit.abbreviation}`;
  }

  function formatLineTotal(item) {
    const total = calcItemLineTotal(item);
    return `₹${total.toFixed(2)}`;
  }

  function calcGrandTotal() {
    let total = new Decimal(0);
    for (const item of items) {
      total = total.plus(calcItemLineTotal(item));
    }
    return total;
  }

  async function handlePlaceOrder() {
    setError("");
    setPlacing(true);

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      orderedUnitId: item.unitId,
      orderedQty: item.qty.toString(),
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          notes: notes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order");
        return;
      }

      clearCart();
      router.push("/seller/orders");
    } catch {
      setError("Network error");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <p className="text-muted-foreground">Your cart is empty</p>
        </div>
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No items in your cart yet</p>
          <Button onClick={() => router.push("/seller/catalog")}>
            Browse Catalog
          </Button>
        </div>
      </div>
    );
  }

  const grandTotal = calcGrandTotal();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Shopping Cart</h2>
        <p className="text-muted-foreground">{items.length} item(s) in your cart</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead className="w-32">Qty</TableHead>
              <TableHead className="text-right">Line Total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const unit = getUnit(item.unitId);
              return (
                <TableRow key={`${item.product.id}-${item.unitId}-${index}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.product.sku}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatItemPrice(item)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        step="any"
                        min="0.01"
                        value={item.qty}
                        onChange={(e) => updateItemQty(index, e.target.value)}
                        className="w-20 h-8"
                      />
                      <span className="text-sm text-muted-foreground">
                        {unit?.abbreviation || ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatLineTotal(item)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="text-right space-y-1">
          <p className="text-lg font-bold">Grand Total: ₹{grandTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Order Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions..."
          rows={2}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={clearCart}>
          Clear Cart
        </Button>
        <Button onClick={handlePlaceOrder} disabled={placing}>
          {placing ? "Placing Order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
