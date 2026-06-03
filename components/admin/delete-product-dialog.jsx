"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function DeleteProductDialog({ open, onOpenChange, product, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete product");
        return;
      }

      onDelete(product.id);
      onOpenChange(false);
    } catch {
      setError("Network error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate &quot;{product?.name}&quot;? This will
            hide it from the seller catalog. This action can be reversed.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deactivating..." : "Deactivate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
