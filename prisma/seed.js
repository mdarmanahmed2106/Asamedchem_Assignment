const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Unit Options ---
  const gram = await prisma.unitOption.upsert({
    where: { abbreviation: "g" },
    update: {},
    create: {
      label: "Gram",
      abbreviation: "g",
      dimension: "WEIGHT",
      conversionFactor: 1,
    },
  });

  const kilogram = await prisma.unitOption.upsert({
    where: { abbreviation: "kg" },
    update: {},
    create: {
      label: "Kilogram",
      abbreviation: "kg",
      dimension: "WEIGHT",
      conversionFactor: 1000,
    },
  });

  const millilitre = await prisma.unitOption.upsert({
    where: { abbreviation: "mL" },
    update: {},
    create: {
      label: "Millilitre",
      abbreviation: "mL",
      dimension: "VOLUME",
      conversionFactor: 1,
    },
  });

  const litre = await prisma.unitOption.upsert({
    where: { abbreviation: "L" },
    update: {},
    create: {
      label: "Litre",
      abbreviation: "L",
      dimension: "VOLUME",
      conversionFactor: 1000,
    },
  });

  const unit = await prisma.unitOption.upsert({
    where: { abbreviation: "unit" },
    update: {},
    create: {
      label: "Unit",
      abbreviation: "unit",
      dimension: "COUNT",
      conversionFactor: 1,
    },
  });

  console.log("Unit options seeded.");

  // --- Categories ---
  const rawMaterials = await prisma.category.upsert({
    where: { name: "Raw Materials" },
    update: {},
    create: { name: "Raw Materials" },
  });

  const solvents = await prisma.category.upsert({
    where: { name: "Solvents" },
    update: {},
    create: { name: "Solvents" },
  });

  const labSupplies = await prisma.category.upsert({
    where: { name: "Lab Supplies" },
    update: {},
    create: { name: "Lab Supplies" },
  });

  const equipment = await prisma.category.upsert({
    where: { name: "Equipment" },
    update: {},
    create: { name: "Equipment" },
  });

  console.log("Categories seeded.");

  // --- Users ---
  const adminHash = await bcrypt.hash("admin123", 10);
  const sellerHash = await bcrypt.hash("seller123", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: adminHash,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: {},
    create: {
      email: "seller@example.com",
      passwordHash: sellerHash,
      name: "Seller User",
      role: "SELLER",
    },
  });

  console.log("Users seeded.");

  // --- Products ---
  // Prices are stored as INR per base unit (per gram, per mL, or per unit)
  const products = [
    {
      sku: "RM-001",
      name: "Aspirin (Acetylsalicylic Acid)",
      description: "Pharmaceutical-grade aspirin powder for synthesis",
      categoryId: rawMaterials.id,
      stockBaseQty: 50000,       // 50,000 grams = 50 kg
      displayUnitId: kilogram.id, // displayed in kg
      pricePerBaseUnit: 0.45,    // INR 0.45/gram = INR 450/kg
    },
    {
      sku: "RM-002",
      name: "Paracetamol API",
      description: "Active pharmaceutical ingredient, USP grade",
      categoryId: rawMaterials.id,
      stockBaseQty: 25000,       // 25 kg
      displayUnitId: kilogram.id,
      pricePerBaseUnit: 0.80,    // INR 800/kg
    },
    {
      sku: "RM-003",
      name: "Citric Acid Anhydrous",
      description: "Food and pharma grade citric acid",
      categoryId: rawMaterials.id,
      stockBaseQty: 100000,      // 100 kg
      displayUnitId: kilogram.id,
      pricePerBaseUnit: 0.12,    // INR 120/kg
    },
    {
      sku: "SV-001",
      name: "Ethanol (99.9%)",
      description: "Laboratory-grade absolute ethanol",
      categoryId: solvents.id,
      stockBaseQty: 20000,       // 20,000 mL = 20 L
      displayUnitId: litre.id,
      pricePerBaseUnit: 0.35,    // INR 0.35/mL = INR 350/L
    },
    {
      sku: "SV-002",
      name: "Methanol HPLC Grade",
      description: "High-purity methanol for chromatography",
      categoryId: solvents.id,
      stockBaseQty: 10000,       // 10 L
      displayUnitId: litre.id,
      pricePerBaseUnit: 0.50,    // INR 500/L
    },
    {
      sku: "SV-003",
      name: "Acetone AR Grade",
      description: "Analytical reagent grade acetone",
      categoryId: solvents.id,
      stockBaseQty: 50000,       // 50 L
      displayUnitId: litre.id,
      pricePerBaseUnit: 0.18,    // INR 180/L
    },
    {
      sku: "LS-001",
      name: "Nitrile Gloves (Box of 100)",
      description: "Powder-free examination gloves, medium size",
      categoryId: labSupplies.id,
      stockBaseQty: 200,         // 200 units (boxes)
      displayUnitId: unit.id,
      pricePerBaseUnit: 450,     // INR 450/unit
    },
    {
      sku: "LS-002",
      name: "Glass Beakers 250mL",
      description: "Borosilicate glass beakers, graduated",
      categoryId: labSupplies.id,
      stockBaseQty: 150,         // 150 units
      displayUnitId: unit.id,
      pricePerBaseUnit: 320,     // INR 320/unit
    },
    {
      sku: "EQ-001",
      name: "Digital pH Meter",
      description: "Benchtop pH meter with auto-calibration",
      categoryId: equipment.id,
      stockBaseQty: 15,          // 15 units
      displayUnitId: unit.id,
      pricePerBaseUnit: 8500,    // INR 8,500/unit
    },
    {
      sku: "EQ-002",
      name: "Magnetic Stirrer with Hot Plate",
      description: "Ceramic top, 0-1500 RPM, max 340C",
      categoryId: equipment.id,
      stockBaseQty: 10,          // 10 units
      displayUnitId: unit.id,
      pricePerBaseUnit: 12500,   // INR 12,500/unit
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log("Products seeded.");
  console.log("Database seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
