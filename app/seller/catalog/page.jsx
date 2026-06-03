"use client";

import { useState, useEffect, useCallback } from "react";
import Decimal from "decimal.js";
import { toDisplayQty, calcDisplayPrice } from "@/lib/units";
import { useCart } from "@/components/seller/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, ShoppingCart } from "lucide-react";

export default function CatalogPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Add to cart dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [qty, setQty] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, unitRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/units"),
      ]);
      const [prodData, catData, unitData] = await Promise.all([
        prodRes.json(),
        catRes.json(),
        unitRes.json(),
      ]);
      setProducts(prodData);
      setCategories(catData);
      setUnits(unitData);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function formatDisplayStock(product) {
    const cf = new Decimal(product.displayUnit.conversionFactor.toString());
    const baseStock = new Decimal(product.stockBaseQty.toString());
    const display = toDisplayQty(baseStock, cf);
    return `${display.toFixed(2)} ${product.displayUnit.abbreviation}`;
  }

  function formatDisplayPrice(product) {
    const cf = new Decimal(product.displayUnit.conversionFactor.toString());
    const basePrice = new Decimal(product.pricePerBaseUnit.toString());
    const display = calcDisplayPrice(basePrice, cf);
    return `₹${display.toFixed(2)}/${product.displayUnit.abbreviation}`;
  }

  function getCompatibleUnits(product) {
    return units.filter((u) => u.dimension === product.displayUnit.dimension);
  }

  function handleAddToCartClick(product) {
    setSelectedProduct(product);
    setSelectedUnitId(product.displayUnitId);
    setQty("");
    setAddedMessage("");
    setAddDialogOpen(true);
  }

  function handleAddToCart() {
    if (!qty || parseFloat(qty) <= 0) return;

    const unit = units.find((u) => u.id === selectedUnitId);
    addItem(
      selectedProduct,
      selectedUnitId,
      qty
    );
    setAddedMessage(
      `Added ${qty} ${unit?.abbreviation || ""} of ${selectedProduct.name} to cart`
    );
    setQty("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Product Catalog</h2>
        <p className="text-muted-foreground">Browse and add products to your cart</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <CardDescription className="text-xs font-mono">
                      {product.sku}
                    </CardDescription>
                  </div>
                  {product.category && (
                    <Badge variant="secondary" className="text-xs">
                      {product.category.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-medium">{formatDisplayStock(product)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold">{formatDisplayPrice(product)}</span>
                </div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handleAddToCartClick(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add to Cart Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add to Cart</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-sm text-muted-foreground">
                Price: {formatDisplayPrice(selectedProduct)}
              </p>

              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getCompatibleUnits(selectedProduct).map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.label} ({u.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              {addedMessage && (
                <p className="text-sm text-green-600">{addedMessage}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={!qty || parseFloat(qty) <= 0}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
