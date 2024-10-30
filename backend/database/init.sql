-- Enable PostGIS extension
--CREATE EXTENSION postgis;

SET search_path TO public;

CREATE TABLE IF NOT EXISTS addresses (
    eas_baseid INTEGER NOT NULL,
    eas_subid INTEGER NOT NULL,
    eas_fullid VARCHAR(255) PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    unit_number VARCHAR(255),
    address_number INTEGER,
    address_number_suffix VARCHAR(255) NOT NULL,
    street_name VARCHAR(255) NOT NULL,
    street_type VARCHAR(255),
    parcel_number VARCHAR(255),
    block VARCHAR(255),
    lot VARCHAR(255),
    cnn INTEGER,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    zip_code INTEGER NOT NULL,
    point GEOGRAPHY(POINT, 4326) NOT NULL,
    supdist VARCHAR(255),
    supervisor INTEGER,
    supdistpad VARCHAR(255),
    numbertext VARCHAR(255),
    supname VARCHAR(255),
    nhood VARCHAR(255),
    complete_landmark_name VARCHAR(255),
    sfdata_as_of DATE NOT NULL,
    sfdata_loaded_at TIMESTAMP NOT NULL
);

/*INSERT INTO addresses (eas_baseid, eas_subid, eas_fullid, address, unit_number, address_number, address_number_suffix, street_name, street_type, parcel_number. block, lot, cnn, longitude, latitude, zip_code, point, supdist, supervisor, supdistpad, numbertext, supname, nhood, complete_landmark_name, data_as_of, data_loaded_at)
VALUES 
(495990, 764765, '495990-764765-0', '46 AUBURN ST', '', 46, '', 'AUBURN', 'ST', '', '', '', 830000, -122.41228, 37.77967, 94133, ST_MakePoint(-122.41228, 37.77967), 'SUPERVISORIAL DISTRICT 3', 3, 3, 'THREE', 'Aaron Peskin', 'Nob Hill', '2024/10/28 03:40:00 AM', '2024/10/28 10:11:26 PM');
*/

CREATE TABLE IF NOT EXISTS combined_risk (
    id SERIAL PRIMARY KEY,
    address VARCHAR(50) NOT NULL UNIQUE,
    soft_story_risk BOOLEAN NOT NULL DEFAULT FALSE,
    seismic_hazard_risk BOOLEAN NOT NULL DEFAULT FALSE,
    landslide_risk BOOLEAN NOT NULL DEFAULT FALSE,
    liquefaction_risk BOOLEAN NOT NULL DEFAULT FALSE
    
);

INSERT INTO combined_risk (address, soft_story_risk, seismic_hazard_risk, landslide_risk, liquefaction_risk) VALUES 
('3560 PIERCE ST, SAN FRANCISCO CA', TRUE, FALSE, FALSE, FALSE),
('3484 18TH ST, SAN FRANCISCO CA', TRUE, TRUE, FALSE, TRUE),
('175 ALHAMBRA ST, SAN FRANCISCO CA', FALSE, FALSE, FALSE, FALSE),
('106 HAIGHT ST, SAN FRANCISCO CA', TRUE, TRUE, TRUE, TRUE),
('3852 CALIFORNIA ST, SAN FRANCISCO CA', FALSE, TRUE, FALSE, TRUE)
;