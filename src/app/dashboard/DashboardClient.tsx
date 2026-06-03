"use client";

import { useState } from "react";
import { DISPLAY_UNITS, convertToBaseUnit, formatINR } from "@/lib/utils";
import { placeOrder } from "./actions";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  basePrice: string; // Serialized Decimal
  baseUnit: "G" | "ML" | "COUNT";
  stockQty: string;
};

export default function DashboardClient({ products }: { products: Product[] }) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [unit, setUnit] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const availableUnits = selectedProduct ? DISPLAY_UNITS[selectedProduct.baseUnit] : [];

  // Update default unit when product changes
  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setUnit(DISPLAY_UNITS[prod.baseUnit][0]);
    }
  };

  const qtyNumber = parseFloat(quantity) || 0;
  
  let calculatedPrice = 0;
  if (selectedProduct && qtyNumber > 0 && unit) {
    const baseQty = convertToBaseUnit(qtyNumber, unit, selectedProduct.baseUnit);
    calculatedPrice = baseQty * parseFloat(selectedProduct.basePrice);
  }

  const handlePlaceOrder = async () => {
    if (!selectedProduct || qtyNumber <= 0 || !unit) return;
    setLoading(true);
    try {
      await placeOrder([{
        productId: selectedProduct.id,
        quantity: qtyNumber,
        unit: unit,
        calculatedPrice
      }], calculatedPrice);
      
      alert("Order placed successfully!");
      setSelectedProductId("");
      setQuantity("1");
      router.refresh();
    } catch (e) {
      alert("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
      {/* Product Catalog */}
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Available Products</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Base Rate</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td>{formatINR(parseFloat(p.basePrice))} / {p.baseUnit.toLowerCase()}</td>
                <td>{p.stockQty} {p.baseUnit.toLowerCase()}</td>
                <td>
                  <button 
                    className="btn" 
                    style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                    onClick={() => handleProductChange(p.id)}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quotation / Ordering Panel */}
      <div className="glass-panel">
        <h2 style={{ marginBottom: "1.5rem" }}>Quotation Builder</h2>
        {!selectedProduct ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Select a product from the catalog to build a quotation.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
              <strong style={{ display: "block", marginBottom: "4px" }}>{selectedProduct.name}</strong>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Base Rate: {formatINR(parseFloat(selectedProduct.basePrice))} per {selectedProduct.baseUnit.toLowerCase()}
              </span>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 2 }}>
                <label className="label">Quantity</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  className="input" 
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Unit</label>
                <select 
                  className="input" 
                  value={unit} 
                  onChange={e => setUnit(e.target.value)}
                >
                  {availableUnits.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Calculated Total:</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--success)" }}>
                  {formatINR(calculatedPrice)}
                </span>
              </div>
              
              <button 
                className="btn" 
                style={{ width: "100%", padding: "12px" }}
                disabled={calculatedPrice <= 0 || loading}
                onClick={handlePlaceOrder}
              >
                {loading ? "Processing..." : "Place Order / Quotation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
