alter table products add column if not exists sku text not null default '';
alter table products add column if not exists name_zh text not null default '';
alter table products add column if not exists summary_zh text not null default '';
alter table products add column if not exists description text not null default '';
alter table products add column if not exists category text not null default 'mixed';
alter table products add column if not exists width_m numeric(4,1) not null default 2.1;
alter table products add column if not exists height_m numeric(4,1) not null default 2.4;
alter table products add column if not exists price_high_usd integer not null default 0;
alter table products add column if not exists moq integer not null default 1;
alter table products add column if not exists lead_days text not null default '25–40 days';
alter table products add column if not exists compliance text not null default 'EU CE, US DOT/NSF';
alter table products add column if not exists gallery_json text not null default '[]';
alter table products add column if not exists specs_json text not null default '[]';
alter table products add column if not exists status text not null default 'published';
alter table products add column if not exists featured boolean not null default false;
alter table products add column if not exists sort_order integer not null default 100;

update products
set status = case when active then 'published' else 'archived' end
where status = '' or (active = false and status = 'published');

create index if not exists products_status_sort_idx on products (status, featured desc, sort_order asc, updated_at desc);
