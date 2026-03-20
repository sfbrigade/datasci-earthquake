select count(*) from landslide_zones;
select count(*) from liquefaction_zones;
select count(*) from soft_story_properties;
select count(*) from tsunami_zones;

select table_name, column_name, data_type from information_schema.columns where table_name = 'liquefaction_zones';
