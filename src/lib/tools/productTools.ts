import { tool, zodSchema } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const searchProducts = tool({
  description:
    "Search for products by category, keyword, or eco rating. Returns matching products with details and sustainability scores.",
  inputSchema: zodSchema(
    z.object({
      category: z
        .string()
        .optional()
        .describe(
          "Product category to filter by (e.g. Home & Kitchen, Clothing, Beauty & Personal, Garden & Outdoors, Kids)"
        ),
      keyword: z
        .string()
        .optional()
        .describe("Keyword to search in product name or description"),
      minEcoRating: z
        .number()
        .min(1)
        .max(5)
        .optional()
        .describe("Minimum eco rating (1-5) to filter by"),
      inStockOnly: z
        .boolean()
        .optional()
        .default(true)
        .describe("Only show in-stock products (default: true)"),
    })
  ),
  execute: async ({ category, keyword, minEcoRating, inStockOnly }) => {
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ];
    }

    if (minEcoRating) {
      where.ecoRating = { gte: minEcoRating };
    }

    if (inStockOnly) {
      where.inStock = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { ecoRating: "desc" },
    });

    if (products.length === 0) {
      return { found: false, message: "No products matched your search." };
    }

    return {
      found: true,
      count: products.length,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        ecoRating: p.ecoRating,
        category: p.category,
        inStock: p.inStock,
      })),
    };
  },
});

export const getProductDetails = tool({
  description:
    "Get full details for a specific product by its ID, including availability.",
  inputSchema: zodSchema(
    z.object({
      productId: z.string().describe("The product ID"),
    })
  ),
  execute: async ({ productId }) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { found: false, message: `No product found with ID "${productId}".` };
    }

    return {
      found: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        ecoRating: product.ecoRating,
        category: product.category,
        inStock: product.inStock,
        imageUrl: product.imageUrl,
      },
    };
  },
});
