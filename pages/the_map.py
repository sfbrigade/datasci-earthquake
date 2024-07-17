import streamlit as st
import folium
from streamlit_folium import st_folium
import json

def show():
    st.title("Map")
    st.write("This is the Map Page.")

    # Create a map object centered on San Francisco with CartoDB Positron tiles
    m = folium.Map(
        location=[37.7749, -122.4194],
        zoom_start=12,
        tiles="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attr="&copy; <a href='https://carto.com/attributions'>CARTO</a>"
    )

    # Add a marker to the map
    folium.Marker([37.7749, -122.4194], popup="San Francisco, CA").add_to(m)

    neighborhoods = open_geojson('data/neighborhoods.geojson')
    soft_story_properties = open_geojson('data/soft_story_properties.geojson')
    folium.GeoJson(neighborhoods).add_to(m)
    folium.GeoJson(soft_story_properties).add_to(m)

    # Display the map using Streamlit
    st_folium(m, width=700, height=500)


    # at zoom, aggregate on neighborhood

    # past zoom, show dots

@st.cache_data
def open_geojson(file):
    with open(file, 'r') as f:
        geojson_data = json.load(f)
    return geojson_data