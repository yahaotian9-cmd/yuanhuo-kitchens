import Link from "next/link";

export function Shell({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  return (
    <>
      <header className="bar">
        <Link href="/">
          <strong>YUANHUO Ops</strong>
        </Link>
        <nav>
          <Link href="/track">Track order</Link>
          {admin ? (
            <>
              <Link href="/admin">Orders</Link>
              <Link href="/admin/products">Products</Link>
              <Link href="/admin/logout">Log out</Link>
            </>
          ) : (
            <Link href="/admin">Admin</Link>
          )}
        </nav>
      </header>
      <main className="wrap" style={{ padding: "1.2rem 0 2.5rem" }}>
        {children}
      </main>
    </>
  );
}
