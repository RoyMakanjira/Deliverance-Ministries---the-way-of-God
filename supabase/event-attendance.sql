alter table events add column if not exists asms text[] not null default '{}';
create table event_attendance(event_id uuid references events on delete cascade, member_id uuid references members on delete cascade, status text not null check(status in('Present','Absent')), primary key(event_id,member_id));
alter table event_attendance enable row level security;
create policy eatt_all on event_attendance for all using (is_super() or exists(select 1 from events e where e.id=event_id and e.prov=my_prov())) with check (is_super() or exists(select 1 from events e where e.id=event_id and e.prov=my_prov()));
