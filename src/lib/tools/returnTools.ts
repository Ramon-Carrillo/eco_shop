import { tool, zodSchema } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const initiateReturn = tool({
  description:
    "Initiate a return for a delivered order. Only orders with DELIVERED status are eligible for returns.",
  inputSchema: zodSchema(
    z.object({
      orderId: z.string().describe("The order ID to return"),
      reason: z
        .string()
        .describe("The reason for the return (provided by the customer)"),
    })
  ),
  execute: async ({ orderId, reason }) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        returns: true,
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    if (!order) {
      return { success: false, message: `No order found with ID "${orderId}".` };
    }

    if (order.status !== "DELIVERED") {
      return {
        success: false,
        message: `Order ${orderId} is not eligible for return because it is currently ${order.status}. Only delivered orders can be returned.`,
      };
    }

    // Check if there's already an active return
    const activeReturn = order.returns.find(
      (r) => r.status === "REQUESTED" || r.status === "APPROVED"
    );
    if (activeReturn) {
      return {
        success: false,
        message: `Order ${orderId} already has an active return (status: ${activeReturn.status}).`,
      };
    }

    const returnRecord = await prisma.return.create({
      data: {
        orderId,
        reason,
      },
    });

    return {
      success: true,
      message: `Return initiated for order ${orderId}. Your return ID is ${returnRecord.id}.`,
      returnId: returnRecord.id,
      items: order.items.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  },
});

export const getReturnStatus = tool({
  description:
    "Check the status of a return by order ID. Shows return details and current status.",
  inputSchema: zodSchema(
    z.object({
      orderId: z.string().describe("The order ID to check returns for"),
    })
  ),
  execute: async ({ orderId }) => {
    const returns = await prisma.return.findMany({
      where: { orderId },
      include: {
        order: {
          include: {
            items: {
              include: { product: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (returns.length === 0) {
      return {
        found: false,
        message: `No returns found for order "${orderId}".`,
      };
    }

    return {
      found: true,
      returns: returns.map((r) => ({
        returnId: r.id,
        orderId: r.orderId,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        orderItems: r.order.items.map((item) => ({
          product: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
      })),
    };
  },
});
