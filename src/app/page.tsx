import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    const role = (session.user as any).role;
    if (role === "ADMIN") {
      redirect("/admin");
    } else if (role === "SELLER") {
      redirect("/seller");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 className="title">AasaMedChem</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Welcome to the Inventory and Order Management System. 
          Please log in to browse products or manage the inventory.
        </p>
        <Link href="/auth/signin">
          <button className="btn" style={{ fontSize: '1.1rem', padding: '12px 32px' }}>
            Sign In to Continue
          </button>
        </Link>
      </div>
    </main>
  );
}
