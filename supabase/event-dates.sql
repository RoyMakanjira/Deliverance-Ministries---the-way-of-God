-- Multi-day events: "From date ... to date ...". end_date is optional (one-day events leave it empty).
alter table events add column if not exists end_date date;
