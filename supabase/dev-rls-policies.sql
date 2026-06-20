-- Development-only RLS policies for the local MVP.
-- These policies let the public anon key read and write project data.
-- Do not use this policy set for production.

alter table public.shows enable row level security;
alter table public.pieces enable row level security;
alter table public.transitions enable row level security;
alter table public.actions enable row level security;
alter table public.action_assignees enable row level security;
alter table public.objects enable row level security;
alter table public.object_instances enable row level security;
alter table public.show_object_instances enable row level security;
alter table public.piece_object_instances enable row level security;
alter table public.action_object_instances enable row level security;
alter table public.show_members enable row level security;
alter table public.piece_performers enable row level security;
alter table public.transition_availability enable row level security;
alter table public.incidents enable row level security;
alter table public.piece_incidents enable row level security;
alter table public.users enable row level security;
alter table public.affinities enable row level security;
alter table public.user_affinities enable row level security;
alter table public.translations enable row level security;

drop policy if exists "dev public select shows" on public.shows;
drop policy if exists "dev public insert shows" on public.shows;
drop policy if exists "dev public update shows" on public.shows;
drop policy if exists "dev public delete shows" on public.shows;
create policy "dev public select shows" on public.shows for select to anon, authenticated using (true);
create policy "dev public insert shows" on public.shows for insert to anon, authenticated with check (true);
create policy "dev public update shows" on public.shows for update to anon, authenticated using (true) with check (true);
create policy "dev public delete shows" on public.shows for delete to anon, authenticated using (true);

drop policy if exists "dev public select pieces" on public.pieces;
drop policy if exists "dev public insert pieces" on public.pieces;
drop policy if exists "dev public update pieces" on public.pieces;
drop policy if exists "dev public delete pieces" on public.pieces;
create policy "dev public select pieces" on public.pieces for select to anon, authenticated using (true);
create policy "dev public insert pieces" on public.pieces for insert to anon, authenticated with check (true);
create policy "dev public update pieces" on public.pieces for update to anon, authenticated using (true) with check (true);
create policy "dev public delete pieces" on public.pieces for delete to anon, authenticated using (true);

drop policy if exists "dev public select transitions" on public.transitions;
drop policy if exists "dev public insert transitions" on public.transitions;
drop policy if exists "dev public update transitions" on public.transitions;
drop policy if exists "dev public delete transitions" on public.transitions;
create policy "dev public select transitions" on public.transitions for select to anon, authenticated using (true);
create policy "dev public insert transitions" on public.transitions for insert to anon, authenticated with check (true);
create policy "dev public update transitions" on public.transitions for update to anon, authenticated using (true) with check (true);
create policy "dev public delete transitions" on public.transitions for delete to anon, authenticated using (true);

drop policy if exists "dev public select actions" on public.actions;
drop policy if exists "dev public insert actions" on public.actions;
drop policy if exists "dev public update actions" on public.actions;
drop policy if exists "dev public delete actions" on public.actions;
create policy "dev public select actions" on public.actions for select to anon, authenticated using (true);
create policy "dev public insert actions" on public.actions for insert to anon, authenticated with check (true);
create policy "dev public update actions" on public.actions for update to anon, authenticated using (true) with check (true);
create policy "dev public delete actions" on public.actions for delete to anon, authenticated using (true);

drop policy if exists "dev public all action_assignees" on public.action_assignees;
create policy "dev public all action_assignees" on public.action_assignees for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all objects" on public.objects;
create policy "dev public all objects" on public.objects for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all object_instances" on public.object_instances;
create policy "dev public all object_instances" on public.object_instances for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all show_object_instances" on public.show_object_instances;
create policy "dev public all show_object_instances" on public.show_object_instances for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all piece_object_instances" on public.piece_object_instances;
create policy "dev public all piece_object_instances" on public.piece_object_instances for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all action_object_instances" on public.action_object_instances;
create policy "dev public all action_object_instances" on public.action_object_instances for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all show_members" on public.show_members;
create policy "dev public all show_members" on public.show_members for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all piece_performers" on public.piece_performers;
create policy "dev public all piece_performers" on public.piece_performers for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all transition_availability" on public.transition_availability;
create policy "dev public all transition_availability" on public.transition_availability for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all incidents" on public.incidents;
create policy "dev public all incidents" on public.incidents for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all piece_incidents" on public.piece_incidents;
create policy "dev public all piece_incidents" on public.piece_incidents for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all users" on public.users;
create policy "dev public all users" on public.users for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all affinities" on public.affinities;
create policy "dev public all affinities" on public.affinities for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all user_affinities" on public.user_affinities;
create policy "dev public all user_affinities" on public.user_affinities for all to anon, authenticated using (true) with check (true);

drop policy if exists "dev public all translations" on public.translations;
create policy "dev public all translations" on public.translations for all to anon, authenticated using (true) with check (true);
