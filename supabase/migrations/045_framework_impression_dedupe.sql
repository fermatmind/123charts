alter table charts_events add column dedupe_key text;
create unique index charts_events_impression_once on charts_events(dedupe_key) where dedupe_key is not null;
notify pgrst,'reload schema';
