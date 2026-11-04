-- Reports stay off the public site until the national admin publishes them.
-- A province admin can see and send reports for their province, but cannot publish.
alter table reports add column if not exists published boolean not null default false;
drop policy if exists rep_read on reports;
drop policy if exists rep_write on reports;
create policy rep_read on reports for select using (published or is_super() or prov = my_prov());
create policy rep_write on reports for all using (is_super() or prov = my_prov()) with check (is_super() or (prov = my_prov() and not published));
