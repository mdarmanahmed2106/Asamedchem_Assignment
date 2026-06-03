import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Decimal from "decimal.js";

// GET /api/products/[id] — get single product
export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      displayUnit: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Sellers cannot view inactive products
  if (!product.isActive && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /api/products/[id] — update product (admin only)
export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  const body = await request.json();
  const { sku, name, description, categoryId, stockBaseQty, displayUnitId, pricePerBaseUnit } = body;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const data = {};

  if (sku !== undefined) data.sku = sku;
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (categoryId !== undefined) data.categoryId = categoryId || null;

  if (displayUnitId !== undefined) {
    const displayUnit = await prisma.unitOption.findUnique({ where: { id: displayUnitId } });
    if (!displayUnit) {
      return NextResponse.json({ error: "Invalid display unit" }, { status: 400 });
    }
    data.displayUnitId = displayUnitId;
  }

  if (stockBaseQty !== undefined) {
    const stockDecimal = new Decimal(stockBaseQty);
    if (stockDecimal.isNegative()) {
      return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 });
    }
    data.stockBaseQty = stockDecimal.toFixed(6);
  }

  if (pricePerBaseUnit !== undefined) {
    const priceDecimal = new Decimal(pricePerBaseUnit);
    if (priceDecimal.isNegative() || priceDecimal.isZero()) {
      return NextResponse.json({ error: "Price must be positive" }, { status: 400 });
    }
    data.pricePerBaseUnit = priceDecimal.toFixed(6);
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
      displayUnit: true,
    },
  });

  return NextResponse.json(product);
}

// DELETE /api/products/[id] — soft-delete product (admin only)
export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json(product);
}
