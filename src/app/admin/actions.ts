"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const basePrice = formData.get("basePrice") as string;
  const baseUnit = formData.get("baseUnit") as "G" | "ML" | "COUNT";
  const stockQty = formData.get("stockQty") as string;

  await prisma.product.create({
    data: {
      name,
      description,
      basePrice: parseFloat(basePrice),
      baseUnit,
      stockQty: parseFloat(stockQty)
    }
  });

  revalidatePath("/admin");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function updateOrderStatus(orderId: string, status: "APPROVED" | "CANCELLED") {
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
  revalidatePath("/admin");
}
