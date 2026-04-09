import { tool, zodSchema } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const getOrder = tool({
  description:
    "Look up an order by its ID (e.g. ECO-10001). Returns order status, items, total, and customer info.",
  inputSchema: zodSchema(
    z.object({
      orderId: z.string().describe("The order ID, e.g. ECO-10001"),
    })
  ),
  execute: async ({ orderId }) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, category: true } },
          },
        },
        returns: true,
      },
    });

    if (!order) {
      return { found: false, message: `No order found with ID "${orderId}".` };
    }

    return {
      found: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        customer: order.user,
        items: order.items.map((item) => ({
          product: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
          price: item.price,
        })),
        returns: order.returns.map((r) => ({
          id: r.id,
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    };
  },
});

export const getOrdersByEmail = tool({
  description:
    "Look up all orders for a customer by their email address. Returns a summary of each order.",
  inputSchema: zodSchema(
    z.object({
      email: z.string().email().describe("Customer email address"),
    })
  ),
  execute: async ({ email }) => {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return {
        found: false,
        message: `No customer found with email "${email}".`,
      };
    }

    return {
      found: true,
      customer: { name: user.name, email: user.email },
      orders: user.orders.map((order) => ({
        id: order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          product: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
      })),
    };
  },
});

export const cancelOrder = tool({
  description:
    "Cancel an order that is still in PROCESSING status. Orders that are shipped or delivered cannot be cancelled.",
  inputSchema: zodSchema(
    z.object({
      orderId: z.string().describe("The order ID to cancel"),
    })
  ),
  execute: async ({ orderId }) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      return { success: false, message: `No order found with ID "${orderId}".` };
    }

    if (order.status !== "PROCESSING") {
      return {
        success: false,
        message: `Order ${orderId} cannot be cancelled because it is currently ${order.status}. Only orders in PROCESSING status can be cancelled.`,
      };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return {
      success: true,
      message: `Order ${orderId} has been successfully cancelled.`,
    };
  },
});
