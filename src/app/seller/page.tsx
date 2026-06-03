import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardClient from "../dashboard/DashboardClient"; // Reuse the same quotation builder client

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  const userRole = (session.user as any).role;
  if (userRole !== "SELLER" && userRole !== "ADMIN") {
    // If a regular BUYER somehow gets here, you could restrict or let them view it.
    // We'll restrict to SELLER and ADMIN for clarity.
    redirect("/dashboard");
  }

  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  
  // Serialize Prisma Decimal to string for passing to Client Component
  const serializedProducts = products.map(p => ({
    ...p,
    basePrice: p.basePrice.toString(),
    stockQty: p.stockQty.toString()
  }));

  const userOrders = await prisma.order.findMany({
    where: { userId: (session as any).id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="title">Seller Dashboard</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Logged in as {session.user?.email} (Seller)
          </span>
          <form action="/api/auth/signout" method="POST">
            <button className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>Sign Out</button>
          </form>
        </div>
      </div>

      {/* Sellers can also build quotations for their customers using the shared client component */}
      <DashboardClient products={serializedProducts} />

      <div className="glass-panel" style={{ marginTop: "2rem", overflowX: "auto" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>My Placed Quotations / Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Items</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {userOrders.map(o => (
              <tr key={o.id}>
                <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{o.id.split("-")[0]}</span></td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td><span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                <td>
                  {o.items.map(i => (
                    <div key={i.id} style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {i.requestedQty.toString()} {i.requestedUnit} {i.product.name}
                    </div>
                  ))}
                </td>
                <td style={{ fontWeight: "bold" }}>₹{o.totalAmount.toString()}</td>
              </tr>
            ))}
            {userOrders.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No quotations or orders generated yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
