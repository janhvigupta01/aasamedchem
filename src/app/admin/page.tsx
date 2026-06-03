import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { createProduct, deleteProduct, updateOrderStatus } from "./actions";
import { formatINR } from "@/lib/utils";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="title">Admin Dashboard</h1>
        <form action="/api/auth/signout" method="POST">
          <button className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>Sign Out</button>
        </form>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        {/* Product Management */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: "1.5rem" }}>Add New Product</h2>
          <form action={createProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label">Product Name</label>
              <input type="text" name="name" className="input" required />
            </div>
            <div>
              <label className="label">Description</label>
              <input type="text" name="description" className="input" required />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label className="label">Base Unit</label>
                <select name="baseUnit" className="input" required>
                  <option value="G">Grams (g)</option>
                  <option value="ML">Milliliters (mL)</option>
                  <option value="COUNT">Item Count (unit)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Base Price (INR per unit)</label>
                <input type="number" step="0.01" name="basePrice" className="input" required />
              </div>
            </div>
            <div>
              <label className="label">Stock Quantity (in base units)</label>
              <input type="number" step="0.01" name="stockQty" className="input" required />
            </div>
            <button type="submit" className="btn" style={{ marginTop: "1rem" }}>Create Product</button>
          </form>
        </div>

        {/* Product List */}
        <div className="glass-panel" style={{ overflowX: "auto" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Inventory</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Base Unit</th>
                <th>Base Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.baseUnit}</td>
                  <td>{formatINR(p.basePrice)}</td>
                  <td>{p.stockQty.toString()}</td>
                  <td>
                    <form action={deleteProduct.bind(null, p.id)}>
                      <button className="btn" style={{ background: "var(--error)", padding: "6px 12px", fontSize: "0.8rem" }}>Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders View */}
      <div className="glass-panel" style={{ marginTop: "2rem", overflowX: "auto" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Recent Quotations & Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Items (Conversion Check)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{o.id.split("-")[0]}</span></td>
                <td>{o.user.email}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td><span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                <td style={{ fontWeight: "bold" }}>{formatINR(o.totalAmount)}</td>
                <td>
                  <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, padding: 0 }}>
                    {o.items.map(i => (
                      <li key={i.id} style={{ marginBottom: "4px" }}>
                        <strong>{i.product.name}</strong> - 
                        Ordered: {i.requestedQty.toString()} {i.requestedUnit} 
                        (Calculated: {formatINR(i.calculatedPrice)})
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  {o.status === "PENDING" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <form action={updateOrderStatus.bind(null, o.id, "APPROVED")}>
                        <button className="btn" style={{ background: "var(--success)", padding: "4px 8px", fontSize: "0.75rem" }}>Approve</button>
                      </form>
                      <form action={updateOrderStatus.bind(null, o.id, "CANCELLED")}>
                        <button className="btn" style={{ background: "var(--error)", padding: "4px 8px", fontSize: "0.75rem" }}>Reject</button>
                      </form>
                    </div>
                  )}
                  {o.status !== "PENDING" && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Processed</span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
