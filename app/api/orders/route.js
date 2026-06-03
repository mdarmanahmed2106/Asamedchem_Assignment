import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Decimal from "decimal.js";
import { toBaseQty, calcLineTotal } from "@/lib/units";

// GET /api/orders — list orders (admin: all, seller: own only)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = {};
  if (session.user.role !== "ADMIN") {
    where.userId = session.user.id;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          orderedUnit: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

// POST /api/orders — create order with transaction (seller only)
export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Only sellers can place orders" }, { status: 403 });
  }

  const body = await request.json();
  const { items, notes } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
  }

  // Validate each item has required fields
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId || !item.orderedUnitId || !item.orderedQty) {
      return NextResponse.json(
        { error: `Item ${i + 1}: missing productId, orderedUnitId, or orderedQty` },
        { status: 400 }
      );
    }
    const qty = new Decimal(item.orderedQty);
    if (qty.isNegative() || qty.isZero()) {
      return NextResponse.json(
        { error: `Item ${i + 1}: quantity must be positive` },
        { status: 400 }
      );
    }
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      let totalINR = new Decimal(0);
      const orderItemsData = [];

      for (const item of items) {
        // 1. Fetch product
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { displayUnit: true },
        });

        if (!product || !product.isActive) {
          throw new Error(`Product ${item.productId} not found or inactive`);
        }

        // 2. Fetch ordered unit
        const orderedUnit = await tx.unitOption.findUnique({
          where: { id: item.orderedUnitId },
        });

        if (!orderedUnit) {
          throw new Error(`Unit ${item.orderedUnitId} not found`);
        }

        // 3. Assert dimension match
        if (orderedUnit.dimension !== product.displayUnit.dimension) {
          throw new Error(
            `Dimension mismatch for product "${product.name}": ` +
            `ordered unit is ${orderedUnit.dimension} but product uses ${product.displayUnit.dimension}`
          );
        }

        // 4. Calculate baseQty
        const orderedQty = new Decimal(item.orderedQty);
        const conversionFactor = new Decimal(orderedUnit.conversionFactor.toString());
        const baseQty = toBaseQty(orderedQty, conversionFactor);

        // 5. Calculate line total
        const pricePerBaseUnit = new Decimal(product.pricePerBaseUnit.toString());
        const lineTotalINR = calcLineTotal(baseQty, pricePerBaseUnit);

        // 6. Check stock sufficiency
        const currentStock = new Decimal(product.stockBaseQty.toString());
        if (currentStock.lessThan(baseQty)) {
          throw new Error(
            `Insufficient stock for "${product.name}": ` +
            `requested ${baseQty.toFixed(6)} base units, available ${currentStock.toFixed(6)}`
          );
        }

        // 7. Decrement stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockBaseQty: currentStock.minus(baseQty).toFixed(6),
          },
        });

        orderItemsData.push({
          productId: product.id,
          orderedUnitId: orderedUnit.id,
          orderedQty: orderedQty.toFixed(6),
          baseQty: baseQty.toFixed(6),
          pricePerBaseUnit: pricePerBaseUnit.toFixed(6),
          lineTotalINR: lineTotalINR.toFixed(6),
        });

        totalINR = totalINR.plus(lineTotalINR);
      }

      // Create the order with all items
      const createdOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalINR: totalINR.toFixed(6),
          notes: notes || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
              orderedUnit: true,
            },
          },
        },
      });

      return createdOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    // Dimension mismatch and stock errors are user-facing
    if (
      error.message.includes("Dimension mismatch") ||
      error.message.includes("Insufficient stock") ||
      error.message.includes("not found")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
