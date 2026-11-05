-- The public Join us / Register form saves straight into members as a New Registration.
-- Visitors can only add: they cannot read, change or delete anyone (mem_all still covers admins).
drop policy if exists mem_register on members;
create policy mem_register on members for insert with check (status = 'New Registration' and char_length(name) between 2 and 120);
