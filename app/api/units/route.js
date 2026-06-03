import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/units — list all unit options
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const units = await prisma.unitOption.findMany({
    orderBy: { dimension: "asc" },
  });

  return NextResponse.json(units);
}
