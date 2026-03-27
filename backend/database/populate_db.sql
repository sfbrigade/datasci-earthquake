select count(*) as liq from liquefaction_zones;
select count(*) as soft from soft_story_properties;
select count(*) as tsu from tsunami_zones;

-- table schemas
select table_name, column_name, data_type from information_schema.columns where table_name = 'liquefaction_zones';
select table_name, column_name, data_type from information_schema.columns where table_name = 'soft_story_properties';
select table_name, column_name, data_type from information_schema.columns where table_name = 'tsunami_zones';

-- keys
select table_name, column_name, constraint_name from information_schema.key_column_usage where table_name = 'liquefaction_zones';
select table_name, column_name, constraint_name from information_schema.key_column_usage where table_name = 'soft_story_properties';
select table_name, column_name, constraint_name from information_schema.key_column_usage where table_name = 'tsunami_zones';
