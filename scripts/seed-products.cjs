/**
 * Seed catalog into MongoDB (upsert by id). Run:
 *   npm run seed:products
 */
require("./load-env.cjs");
const { PrismaClient } = require("@prisma/client");
const { products } = require("./catalog-products.cjs");

const prisma = new PrismaClient();

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: { ...p, published: true },
      update: { ...p, published: true },
    });
  }
  console.log(`Upserted ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
