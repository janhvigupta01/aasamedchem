"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      role,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="title" style={{ fontSize: '1.5rem', textAlign: 'center' }}>Sign In</h2>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem', lineHeight: '1.6' }}>
          <p>If you have an account, select your role and login.</p>
          <p>If you don't have an account, the system will create one with the role you select!</p>
          <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
            <em>(Test Admin: admin@example.com / admin123)</em>
          </p>
        </div>

        {error && (
          <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">I am a...</label>
            <select 
              className="input" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="ADMIN">System Admin</option>
              <option value="SELLER">Seller</option>
              <option value="BUYER">Buyer</option>
            </select>
          </div>
          <div>
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
