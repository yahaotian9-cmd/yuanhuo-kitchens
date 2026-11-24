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
          <strong>TAIHONG 后台</strong>
        </Link>
        <nav>
          <Link href="/track">客户查单</Link>
          {admin ? (
            <>
              <Link href="/admin">订单管理</Link>
              <Link href="/admin/products">商品上品</Link>
              <a href="/admin/logout">退出</a>
            </>
          ) : (
            <Link href="/admin">进入后台</Link>
          )}
        </nav>
      </header>
      <main className="wrap" style={{ padding: "1.2rem 0 2.5rem" }}>
        {children}
      </main>
    </>
  );
}
