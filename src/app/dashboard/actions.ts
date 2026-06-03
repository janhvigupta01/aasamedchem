"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { convertToBaseUnit } from "@/lib/utils";

export async function placeOrder(items: { productId: string, quantity: number, unit: string, calculatedPrice: number }[], totalAmount: number) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const userId = (session as any).id;

  // We perform the order creation in a transaction if we were doing stock updates.
  // For the hackathon, creating the order and items is enough.
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      status: "PENDING",
      items: {
        create: items.map(i => ({
          productId: i.productId,
          requestedQty: i.quantity,
          requestedUnit: i.unit,
          calculatedPrice: i.calculatedPrice
        }))
      }
    }
  });

  return order.id;
}
