"use client";

import { useState, useEffect } from "react";
import Decimal from "decimal.js";
import { toBaseQty, calcDisplayPrice } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  units,
  onSave,
}) {
  const isEditing = !!product;

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [displayUnitId, setDisplayUnitId] = useState("");
  const [stockDisplay, setStockDisplay] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setName(product.name);
      setDescription(product.description || "");
      setCategoryId(product.categoryId || "");
      setDisplayUnitId(product.displayUnitId);

      // Convert base values to display values for the form
      const cf = new Decimal(product.displayUnit.conversionFactor.toString());
      const baseStock = new Decimal(product.stockBaseQty.toString());
      const basePrice = new Decimal(product.pricePerBaseUnit.toString());

      // Stock: base → display (divide by conversionFactor)
      setStockDisplay(baseStock.div(cf).toString());
      // Price: base → display (multiply by conversionFactor)
      setPriceDisplay(calcDisplayPrice(basePrice, cf).toString());
    } else {
      setSku("");
      setName("");
      setDescription("");
      setCategoryId("");
      setDisplayUnitId("");
      setStockDisplay("");
      setPriceDisplay("");
    }
    setError("");
  }, [product, open]);

  function getSelectedUnit() {
    return units.find((u) => u.id === displayUnitId);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!sku || !name || !displayUnitId || !stockDisplay || !priceDisplay) {
      setError("All required fields must be filled");
      return;
    }

    const selectedUnit = getSelectedUnit();
    if (!selectedUnit) {
      setError("Please select a display unit");
      return;
    }

    const cf = new Decimal(selectedUnit.conversionFactor.toString());
    const displayStock = new Decimal(stockDisplay);
    const displayPrice = new Decimal(priceDisplay);

    // Convert display values to base values for the API
    const stockBaseQty = toBaseQty(displayStock, cf);
    const pricePerBaseUnit = displayPrice.div(cf);

    setSaving(true);

    try {
      const url = isEditing ? `/api/products/${product.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          name,
          description: description || null,
          categoryId: categoryId || null,
          displayUnitId,
          stockBaseQty: stockBaseQty.toString(),
          pricePerBaseUnit: pricePerBaseUnit.toString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save product");
        return;
      }

      onSave(data);
      onOpenChange(false);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const selectedUnit = getSelectedUnit();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g., RM-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Display Unit *</Label>
              <Select value={displayUnitId} onValueChange={setDisplayUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.label} ({u.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">
                Stock {selectedUnit ? `(${selectedUnit.abbreviation})` : ""} *
              </Label>
              <Input
                id="stock"
                type="number"
                step="any"
                min="0"
                value={stockDisplay}
                onChange={(e) => setStockDisplay(e.target.value)}
                placeholder="e.g., 50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">
                Price (INR/{selectedUnit ? selectedUnit.abbreviation : "unit"}) *
              </Label>
              <Input
                id="price"
                type="number"
                step="any"
                min="0"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(e.target.value)}
                placeholder="e.g., 450"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
