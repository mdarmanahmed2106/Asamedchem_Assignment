import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Decimal from "decimal.js";

// GET /api/products — list products (admin sees all, seller sees active only)
export async function GET(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");

  const where = {};

  // Sellers only see active products
  if (session.user.role !== "ADMIN") {
    where.isActive = true;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      displayUnit: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

// POST /api/products — create product (admin only)
export async function POST(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { sku, name, description, categoryId, stockBaseQty, displayUnitId, pricePerBaseUnit } = body;

  if (!sku || !name || !displayUnitId || stockBaseQty === undefined || pricePerBaseUnit === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: sku, name, displayUnitId, stockBaseQty, pricePerBaseUnit" },
      { status: 400 }
    );
  }

  // Validate numeric fields with decimal.js
  const stockDecimal = new Decimal(stockBaseQty);
  const priceDecimal = new Decimal(pricePerBaseUnit);

  if (stockDecimal.isNegative()) {
    return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 });
  }
  if (priceDecimal.isNegative() || priceDecimal.isZero()) {
    return NextResponse.json({ error: "Price must be positive" }, { status: 400 });
  }

  // Verify displayUnit exists
  const displayUnit = await prisma.unitOption.findUnique({ where: { id: displayUnitId } });
  if (!displayUnit) {
    return NextResponse.json({ error: "Invalid display unit" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      sku,
      name,
      description: description || null,
      categoryId: categoryId || null,
      stockBaseQty: stockDecimal.toFixed(6),
      displayUnitId,
      pricePerBaseUnit: priceDecimal.toFixed(6),
    },
    include: {
      category: true,
      displayUnit: true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
