-- Which ministries an event is for (e.g. {youth}); it then shows on those ministry pages only.
-- Empty = a general church event, shown on the homepage and assembly pages but on no ministry page.
alter table events add column if not exists ministries text[] not null default '{}';
