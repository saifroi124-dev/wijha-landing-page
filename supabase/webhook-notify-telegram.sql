-- Run in Supabase Dashboard → SQL Editor (one time)
-- Uses pg_net (net.http_post) — no supabase_functions schema needed.
-- Replace YOUR_SERVICE_ROLE_KEY with Project Settings → API → service_role (secret).

create extension if not exists pg_net with schema extensions;

create or replace function public.trigger_notify_telegram()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://ojbmsklrksicujieiprl.supabase.co/functions/v1/notify-telegram',
    body := json_build_object(
      'type', 'INSERT',
      'table', 'leads',
      'schema', 'public',
      'record', row_to_json(NEW),
      'old_record', null
    )::jsonb,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    )::jsonb,
    timeout_milliseconds := 5000
  );
  return NEW;
end;
$$;

drop trigger if exists notify_telegram_on_lead on public.leads;
create trigger notify_telegram_on_lead
  after insert on public.leads
  for each row
  execute function public.trigger_notify_telegram();
