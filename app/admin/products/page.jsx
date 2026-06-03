"use client";

import { useState, useEffect, useCallback } from "react";
import Decimal from "decimal.js";
import { toDisplayQty, calcDisplayPrice } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ProductFormDialog from "@/components/admin/product-form-dialog";
import DeleteProductDialog from "@/components/admin/delete-product-dialog";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, unitsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/units"),
      ]);
      const [productsData, categoriesData, unitsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        unitsRes.json(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setUnits(unitsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  function handleAddClick() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function handleEditClick(product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function handleDeleteClick(product) {
    setDeletingProduct(product);
    setDeleteOpen(true);
  }

  function handleSave() {
    fetchData();
  }

  function handleDelete() {
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name || "—"}</TableCell>
                  <TableCell className="text-right">{formatDisplayStock(product)}</TableCell>
                  <TableCell className="text-right">{formatDisplayPrice(product)}</TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {product.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        categories={categories}
        units={units}
        onSave={handleSave}
      />

      {deletingProduct && (
        <DeleteProductDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          product={deletingProduct}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
