/* Disclaimer: this is mock data. It should not be relied upon to determine any property’s safety or compliance with the soft story program.*/

-- Create PostGIS extension
create extension if not exists postgis;

set search_path to public;

create table if not exists addresses (
    eas_fullid varchar(255) primary key,
    address varchar(255) not null,
    unit_number varchar(255),
    address_number integer,
    street_name varchar(255) not null,
    street_type varchar(255),
    parcel_number varchar(255),
    block varchar(255),
    lot varchar(255),
    cnn integer,
    longitude float not null,
    latitude float not null,
    zip_code integer not null,
    point Geometry(point, 4326) not null,
    supdist varchar(255),
    supervisor integer,
    supname varchar(255),
    nhood varchar(255),
    sfdata_as_of timestamp not null,
    created_timestamp timestamp,
    update_timestamp timestamp
);

create table if not exists seismic_hazard_zones (
    identifier integer primary key,
    geometry Geometry(multipolygon, 4326) not null,
    update_timestamp timestamp
);
-- Potential functions to creat a Point: ST_MakePoint(-122.41228, 37.77967); ST_GeomFromText('POINT(-122.41228, 37.77967)', 4326); ST_SetSRID(ST_MakePoint(-122.41228, 37.77967), 4326)

insert into addresses (eas_fullid,        address,      unit_number,  address_number, street_name, street_type, parcel_number, block, lot, cnn,    longitude,  latitude, zip_code,  point,                                                  supdist,                    supervisor, supname,         nhood,     sfdata_as_of,             created_timestamp,      update_timestamp) values 
                    ('495990-764765-0', '46 AUBURN ST', '',           46,             'AUBURN',    'ST',        '',            '',    '',  830000, -122.41228, 37.77967, 94133, ST_SetSRID(ST_MakePoint(-122.41228, 37.77967), 4326),   'SUPERVISORIAL DISTRICT 3', 3,          'Aaron Peskin', 'Nob Hill', '2024/10/28 03:40:00 AM', '2024/10/28 10:11:26 PM', '2024/11/28 5:11:26 PM'),
                    ('12345-678-9',     '10 TEST ST',   '',           10,             'TEST',    'ST',        '',            '',     '',    800050, -122.41509, 37.64097, 94000, ST_SetSRID(ST_MakePoint(-122.41509, 37.64097), 4326),   'SUPERVISORIAL DISTRICT 2', 2,          'User Name', 'Nob Hill', '2024/10/29 03:40:00 AM', '2024/10/29 10:11:26 PM', '2024/11/29 5:11:26 PM');

insert into seismic_hazard_zones (identifier, geometry, update_timestamp) values 
                                (1, ST_GeomFromText('MULTIPOLYGON(
                                        ((-122.5 37.7, -122.4 37.7, -122.4 37.8, -122.5 37.8, -122.5 37.7)),
                                        ((-122.6 37.6, -122.5 37.6, -122.5 37.7, -122.6 37.7, -122.6 37.6))
                                    )', 4326), 
                                '2024/12/16 5:10:00 PM'),

                                (2, ST_GeomFromText('MULTIPOLYGON(
                                        ((-122.4 37.8, -122.3 37.8, -122.35 37.85, -122.4 37.8)),
                                        ((-122.5 37.7, -122.4 37.7, -122.4 37.8, -122.5 37.8, -122.5 37.7))
                                    )', 4326), 
                                '2024/12/17 3:10:00 PM');


create table if not exists combined_risk (
    id serial primary key,
    address varchar(50) not null unique,
    soft_story_risk boolean not null default false,
    seismic_hazard_risk boolean not null default false,
    landslide_risk boolean not null default false,
    liquefaction_risk boolean not null default false
);

/*create table if not exists soft_story_addresses (
    identifier integer not null,
    block varchar(255),
    lot varchar(255),
    parcel_number varchar(255),
    property_address varchar(255),
    address varchar(255),
    tier integer,
    status varchar(255),
    bos_district integer,
    --point: Mapped[Geometry] = mapped_column(Geometry("POINT", srid=4326))
    sfdata_as_of timestamp,
    sfdata_loaded_at timestamp
    --update_timestamp timestamp
);
*/
insert into combined_risk (address,                                soft_story_risk, seismic_hazard_risk, landslide_risk, liquefaction_risk) values 
                          ('3560 PIERCE ST, SAN FRANCISCO CA',     true,            false,               false,          false),
                          ('3484 18TH ST, SAN FRANCISCO CA',       true,            true,                false,          true),
                          ('175 ALHAMBRA ST, SAN FRANCISCO CA',    false,           false,               false,          false),
                          ('106 HAIGHT ST, SAN FRANCISCO CA',      true,            true,                true,           true),
                          ('3852 CALIFORNIA ST, SAN FRANCISCO CA', false,           true,                false,          true);

--add point column between bos_district and sfdata_as_of
--Here they are in order for our rows
--POINT (-122.424966202 37.762929444)
--POINT (-122.412108664 37.805406258)
--POINT (-122.507457108 37.756334425)
--POINT (-122.444181708 37.771944708)
--POINT (-122.479013074 37.764537366)
--POINT (-122.400877183 37.753556427)

--add update_timestamp column after sfdata_loaded_at
--this column will be filled with data generated at runtime by our code

--status column is a varchar in the database but must be transformed into a boolean for use
--possibly keep the booleans in the transformed database in memory between updates

/*insert into soft_story_addresses (identifier, block, lot, parcel_number, property_address, address,                            tier, status,                      bos_district, sfdata_as_of,             sfdata_loaded_at) values
                                 (1,          3578,  71,  3578071,       '3549 17TH ST',   '3549 17TH ST, SAN FRANCISCO CA',   3,    'Work Complete CFC Issued',  8,            '2024/11/04 03:18:13 AM', '2024/11/04 03:30:26 AM'), 
                                 (2,          41,    4,   41004,         '2231 POWELL ST', '2231 POWELL ST, SAN FRANCISCO CA', 3,    'Non-Compliant',             3,            '2024/11/04 03:18:13 AM', '2024/11/04 03:30:26 AM'),
                                 (3,          1896,  46,  1896046,       '1612 48TH AV',   '1612 48TH AV, SAN FRANCISCO CA',   3,    'Work Complete, CFC Issued', 4,            '2024/11/04 03:18:13 AM', '2024/11/04 03:30:26 AM'),
                                 (4,          1222,  55,  1222055,       '253 CENTRAL AV', '253 CENTRAL AV, SAN FRANCISCO CA', 3,    'Work Complete, CFC Issued', 5,            '2024/11/04 03:18:13 AM', '2024/11/04 03:30:26 AM'),
                                 (5,          1730,  49,  1730049,       '1240 21ST AV',   '1240 21ST AV, SAN FRANCISCO CA',   3,    'Work Complete, CFC Issued', 4,            '2024/11/04 03:18:13 AM', '2024/11/04 03:30:26 AM'),
                                 (6,          4217,  12,  4217012,       '2120 24TH ST',   '2120 24TH ST, SAN FRANCISCO CA',   3,    'Work Complete, CFC Issued', 10,           '2024/11/04 03:18:13 AM', '2024/11/04 03:30:26 AM');
                                 */