-- The picture on each assembly's card in the moving Assemblies strip on the homepage.
-- Empty = the card uses the first "Pictures of the church" photo, or the church logo.
alter table assembly_info add column if not exists cover_url text;
