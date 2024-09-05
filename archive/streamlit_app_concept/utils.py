import geopandas as gpd 
import streamlit as st

@st.cache_data
def load_geojsons():
    neighborhoods = gpd.read_file('../../analytics/data/neighborhoods.geojson')
    soft_story_properties = gpd.read_file('../../analytics/data/soft_story_properties.geojson')
    tsunami_zone = gpd.read_file('../../analytics/data/tsunami.geojson')
    seismic_hazard = gpd.read_file('../../analytics/data/seismic_hazard.geojson')
    
    return neighborhoods, soft_story_properties, tsunami_zone, seismic_hazard