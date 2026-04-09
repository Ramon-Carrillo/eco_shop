import "dotenv/config";
import { PrismaClient, OrderStatus, ReturnStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// prisma dev uses a proxy URL (prisma+postgres://). Extract the real PG URL from the encoded api_key.
function getDirectDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || "";
  const match = url.match(/api_key=(.+)/);
  if (match) {
    const decoded = JSON.parse(Buffer.from(match[1], "base64").toString());
    return decoded.databaseUrl;
  }
  return url;
}

const adapter = new PrismaPg({ connectionString: getDirectDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.return.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const users = await Promise.all([
    prisma.user.create({ data: { name: "Sarah Chen", email: "sarah.chen@example.com" } }),
    prisma.user.create({ data: { name: "Marcus Johnson", email: "marcus.j@example.com" } }),
    prisma.user.create({ data: { name: "Emily Rodriguez", email: "emily.r@example.com" } }),
    prisma.user.create({ data: { name: "David Kim", email: "david.kim@example.com" } }),
    prisma.user.create({ data: { name: "Olivia Thompson", email: "olivia.t@example.com" } }),
    prisma.user.create({ data: { name: "James Patel", email: "james.p@example.com" } }),
    prisma.user.create({ data: { name: "Sophia Williams", email: "sophia.w@example.com" } }),
  ]);

  // --- Products ---
  const products = await Promise.all([
    // Home & Kitchen
    prisma.product.create({ data: { name: "Bamboo Cutting Board Set", description: "Set of 3 organic bamboo cutting boards. Naturally antimicrobial and sustainably harvested.", price: 34.99, ecoRating: 5, category: "Home & Kitchen" } }),
    prisma.product.create({ data: { name: "Beeswax Food Wraps (6-pack)", description: "Reusable food wraps made from organic cotton and beeswax. Replaces plastic wrap.", price: 18.99, ecoRating: 5, category: "Home & Kitchen" } }),
    prisma.product.create({ data: { name: "Recycled Glass Tumbler Set", description: "Set of 4 handblown tumblers made from 100% recycled glass. Each one is unique.", price: 42.00, ecoRating: 4, category: "Home & Kitchen" } }),
    prisma.product.create({ data: { name: "Compostable Sponge Pack", description: "Pack of 8 plant-based sponges. Fully compostable at end of life.", price: 12.50, ecoRating: 5, category: "Home & Kitchen" } }),

    // Clothing
    prisma.product.create({ data: { name: "Organic Cotton Hoodie", description: "Unisex hoodie made from 100% GOTS-certified organic cotton. Relaxed fit.", price: 68.00, ecoRating: 4, category: "Clothing" } }),
    prisma.product.create({ data: { name: "Recycled Denim Jacket", description: "Classic jacket made from 80% recycled denim fibers. Water-saving production.", price: 89.99, ecoRating: 4, category: "Clothing" } }),
    prisma.product.create({ data: { name: "Hemp Blend T-Shirt", description: "Soft hemp and organic cotton blend tee. Naturally UV-resistant and breathable.", price: 32.00, ecoRating: 5, category: "Clothing" } }),

    // Beauty & Personal
    prisma.product.create({ data: { name: "Shampoo Bar (Lavender)", description: "Solid shampoo bar equivalent to 3 bottles. Zero-waste packaging.", price: 14.99, ecoRating: 5, category: "Beauty & Personal" } }),
    prisma.product.create({ data: { name: "Bamboo Toothbrush (4-pack)", description: "Biodegradable bamboo handles with BPA-free bristles. Dentist approved.", price: 9.99, ecoRating: 5, category: "Beauty & Personal" } }),
    prisma.product.create({ data: { name: "Refillable Deodorant", description: "Aluminum-free deodorant in a refillable stainless steel case.", price: 22.00, ecoRating: 4, category: "Beauty & Personal" } }),

    // Garden & Outdoors
    prisma.product.create({ data: { name: "Compost Bin (Countertop)", description: "Stainless steel countertop compost bin with charcoal filter. Holds 1.3 gallons.", price: 29.99, ecoRating: 4, category: "Garden & Outdoors" } }),
    prisma.product.create({ data: { name: "Seed Starter Kit", description: "Organic herb seed starter with biodegradable pots. Includes basil, cilantro, and mint.", price: 24.99, ecoRating: 5, category: "Garden & Outdoors" } }),
    prisma.product.create({ data: { name: "Solar Garden Lights (6-pack)", description: "Waterproof solar-powered LED path lights. No wiring needed.", price: 39.99, ecoRating: 4, category: "Garden & Outdoors" } }),

    // Kids
    prisma.product.create({ data: { name: "Organic Cotton Baby Onesie", description: "Super soft GOTS-certified onesie. Gentle on sensitive skin.", price: 19.99, ecoRating: 5, category: "Kids" } }),
    prisma.product.create({ data: { name: "Wooden Block Set", description: "32-piece set made from FSC-certified maple. Non-toxic water-based paint.", price: 36.00, ecoRating: 5, category: "Kids" } }),
    prisma.product.create({ data: { name: "Recycled Plastic Lunchbox", description: "BPA-free lunchbox made from ocean-recovered recycled plastic. Leak-proof.", price: 16.99, ecoRating: 4, category: "Kids" } }),
  ]);

  // --- Orders ---
  const orders = await Promise.all([
    // Sarah — delivered order
    prisma.order.create({
      data: {
        id: "ECO-10001",
        userId: users[0].id,
        status: OrderStatus.DELIVERED,
        total: 53.98,
        items: {
          create: [
            { productId: products[0].id, quantity: 1, price: 34.99 },
            { productId: products[1].id, quantity: 1, price: 18.99 },
          ],
        },
      },
    }),
    // Marcus — shipped order
    prisma.order.create({
      data: {
        id: "ECO-10002",
        userId: users[1].id,
        status: OrderStatus.SHIPPED,
        total: 89.99,
        items: {
          create: [
            { productId: products[5].id, quantity: 1, price: 89.99 },
          ],
        },
      },
    }),
    // Emily — processing order
    prisma.order.create({
      data: {
        id: "ECO-10003",
        userId: users[2].id,
        status: OrderStatus.PROCESSING,
        total: 82.98,
        items: {
          create: [
            { productId: products[2].id, quantity: 1, price: 42.00 },
            { productId: products[10].id, quantity: 1, price: 29.99 },
            { productId: products[8].id, quantity: 1, price: 9.99 },
          ],
        },
      },
    }),
    // David — delivered order (will have a return)
    prisma.order.create({
      data: {
        id: "ECO-10004",
        userId: users[3].id,
        status: OrderStatus.DELIVERED,
        total: 100.00,
        items: {
          create: [
            { productId: products[4].id, quantity: 1, price: 68.00 },
            { productId: products[6].id, quantity: 1, price: 32.00 },
          ],
        },
      },
    }),
    // Olivia — cancelled order
    prisma.order.create({
      data: {
        id: "ECO-10005",
        userId: users[4].id,
        status: OrderStatus.CANCELLED,
        total: 36.00,
        items: {
          create: [
            { productId: products[14].id, quantity: 1, price: 36.00 },
          ],
        },
      },
    }),
    // James — delivered order (will have a return)
    prisma.order.create({
      data: {
        id: "ECO-10006",
        userId: users[5].id,
        status: OrderStatus.DELIVERED,
        total: 64.98,
        items: {
          create: [
            { productId: products[11].id, quantity: 1, price: 24.99 },
            { productId: products[12].id, quantity: 1, price: 39.99 },
          ],
        },
      },
    }),
    // Sophia — shipped order
    prisma.order.create({
      data: {
        id: "ECO-10007",
        userId: users[6].id,
        status: OrderStatus.SHIPPED,
        total: 47.98,
        items: {
          create: [
            { productId: products[7].id, quantity: 1, price: 14.99 },
            { productId: products[6].id, quantity: 1, price: 32.00 },
          ],
        },
      },
    }),
    // Sarah — second order, processing
    prisma.order.create({
      data: {
        id: "ECO-10008",
        userId: users[0].id,
        status: OrderStatus.PROCESSING,
        total: 59.98,
        items: {
          create: [
            { productId: products[13].id, quantity: 2, price: 19.99 },
            { productId: products[15].id, quantity: 1, price: 16.99 },
          ],
        },
      },
    }),
    // Marcus — delivered
    prisma.order.create({
      data: {
        id: "ECO-10009",
        userId: users[1].id,
        status: OrderStatus.DELIVERED,
        total: 22.00,
        items: {
          create: [
            { productId: products[9].id, quantity: 1, price: 22.00 },
          ],
        },
      },
    }),
    // Emily — delivered
    prisma.order.create({
      data: {
        id: "ECO-10010",
        userId: users[2].id,
        status: OrderStatus.DELIVERED,
        total: 57.49,
        items: {
          create: [
            { productId: products[3].id, quantity: 1, price: 12.50 },
            { productId: products[1].id, quantity: 1, price: 18.99 },
            { productId: products[11].id, quantity: 1, price: 24.99 },
          ],
        },
      },
    }),
  ]);

  // --- Returns ---
  await Promise.all([
    // David returning the hoodie
    prisma.return.create({
      data: {
        orderId: orders[3].id,
        reason: "Size too small, need to exchange for a larger size",
        status: ReturnStatus.APPROVED,
      },
    }),
    // James returning solar lights
    prisma.return.create({
      data: {
        orderId: orders[5].id,
        reason: "Lights stopped working after one week",
        status: ReturnStatus.REQUESTED,
      },
    }),
    // Emily returning beeswax wraps
    prisma.return.create({
      data: {
        orderId: orders[9].id,
        reason: "Allergic reaction to beeswax, need a refund",
        status: ReturnStatus.COMPLETED,
      },
    }),
  ]);

  console.log("Seed complete: 7 users, 16 products, 10 orders, 3 returns");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
