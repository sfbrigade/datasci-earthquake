select count(*) as land from landslide_zones;
select count(*) as liq from liquefaction_zones;
select count(*) as soft from soft_story_properties;
select count(*) as tsu from tsunami_zones;

select table_name, column_name, data_type from information_schema.columns where table_name = 'landslide_zones';
select table_name, column_name, data_type from information_schema.columns where table_name = 'liquefaction_zones';
select table_name, column_name, data_type from information_schema.columns where table_name = 'soft_story_properties';
select table_name, column_name, data_type from information_schema.columns where table_name = 'tsunami_zones';
