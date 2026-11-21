create table if not exists products (
  id bigserial primary key,
  slug text not null unique,
  name text not null,
  summary text not null default '',
  body_type text not null default 'trailer',
  length_m numeric(4,1) not null default 5.2,
  base_price_usd integer not null default 0,
  cover_url text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id bigserial primary key,
  code text not null unique,
  product_id bigint references products(id) on delete set null,
  customer_name text not null,
  company text not null default '',
  country text not null,
  email text not null,
  whatsapp text not null default '',
  config_json text not null default '{}',
  status text not null default 'inquiry',
  total_usd integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_email_idx on orders (lower(email));
create index if not exists orders_status_idx on orders (status);

create table if not exists payments (
  id bigserial primary key,
  order_id bigint not null references orders(id) on delete cascade,
  kind text not null,
  amount_usd integer not null,
  method text not null default '',
  reference text not null default '',
  paid_at date,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists production_media (
  id bigserial primary key,
  order_id bigint not null references orders(id) on delete cascade,
  kind text not null,
  title text not null default '',
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists shipments (
  id bigserial primary key,
  order_id bigint not null unique references orders(id) on delete cascade,
  carrier text not null default '',
  tracking_no text not null default '',
  etd date,
  eta date,
  status text not null default 'preparing',
  last_event text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
