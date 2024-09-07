import streamlit as st
import folium
from streamlit_folium import st_folium
import geopandas as gpd
import json
from folium.plugins import MarkerCluster
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import geopandas as gpd
from shapely.geometry import Point
import os
import certifi

@st.cache_data
def open_geojson(file):
    with open(file, 'r') as f:
        geojson_data = json.load(f)
    return geojson_data

# Cache the loading of the GeoJSON data
@st.cache_data
def load_geojsons():
    neighborhoods = gpd.read_file('../../analytics/data/neighborhoods.geojson')
    soft_story_properties = open_geojson('../../analytics/data/soft_story_properties.geojson')
    tsunami_zone = gpd.read_file('../../analytics/data/tsunami.geojson')
    seismic_hazard = gpd.read_file('../../analytics/data/seismic_hazard.geojson')
    
    return neighborhoods, soft_story_properties, tsunami_zone, seismic_hazard


def show():

    # Set the SSL certificate file path explicitly
    os.environ['SSL_CERT_FILE'] = certifi.where()

    st.title("Map")

    # Call the cached function to load the GeoJSON data
    neighborhoods, soft_story_properties, tsunami_zone, seismic_hazard = load_geojsons()


    # Display legend inline (before the map)
    st.markdown("""
    <div style="background-color: white; padding: 10px; border: 1px solid grey;">
        <b>Legend</b><br>
        <i style="color:red;">●</i> Non-Compliant<br>
        <i style="color:blue;">●</i> Compliant<br>
        <span style="background-color:#FFDAB9; padding: 2px 8px;">&nbsp;</span> Seismic Hazard Zone<br>
        <span style="background-color:blue; opacity:0.4; padding: 2px 8px;">&nbsp;</span> Tsunami Hazard Zone<br>
    </div>
    """, unsafe_allow_html=True)

    # Create a map object centered on San Francisco with OpenStreetMap tiles
    m = folium.Map(
        location=[37.7749, -122.4194],
        zoom_start=12,
        tiles="OpenStreetMap"
    )



    # Clip the tsunami zone by the neighborhoods
    clipped_tsunami_zone = gpd.overlay(tsunami_zone, neighborhoods, how='intersection')

    # Convert clipped GeoDataFrame to GeoJSON
    clipped_tsunami_geojson = json.loads(clipped_tsunami_zone.to_json())
    seismic_hazard_geojson = json.loads(seismic_hazard.to_json())

    # Add neighborhoods GeoJSON layer to the map
    folium.GeoJson(json.loads(neighborhoods.to_json())).add_to(m)

    # Add the clipped tsunami polygon GeoJSON with a semi-transparent blue overlay
    folium.GeoJson(
        clipped_tsunami_geojson,
        style_function=lambda feature: {
            'fillColor': 'blue',
            'color': 'blue',
            'weight': 2,
            'fillOpacity': 0.4,  # Set the transparency here
        }
    ).add_to(m)

    # Add the seismic hazard polygon GeoJSON with a translucent peach overlay
    folium.GeoJson(
        seismic_hazard_geojson,
        style_function=lambda feature: {
            'fillColor': '#FFDAB9',  # Peach color
            'color': '#FFDAB9',      # Peach color for the border
            'weight': 2,
            'fillOpacity': 0.4,      # Set the transparency here
        }
    ).add_to(m)

    # Initialize a MarkerCluster object
    marker_cluster = MarkerCluster().add_to(m)

    # Initialize counters for tsunami and seismic hazard zones
    total_properties = len(soft_story_properties['features'])
    tsunami_count = 0
    seismic_count = 0
    tsunami_and_seismic_count = 0
    noncompliant_count = 0


    # Add soft story properties as clustered circle markers with color based on compliance status
    soft_story_coords = []
    soft_story_data = []
    for feature in soft_story_properties['features']:
        # Check if the feature has a valid geometry object before processing
        if feature and 'geometry' in feature and feature['geometry'] and feature['geometry'].get('coordinates'):
            coords = feature['geometry']['coordinates']
            point = Point(coords[0], coords[1])
            status = feature['properties'].get('status', 'Compliant')  # Default to Compliant if status not found
            color = 'red' if status == 'Non-Compliant' else 'blue'  # Red for Non-Compliant, Blue otherwise
            soft_story_coords.append((coords[1], coords[0]))  # Collect coordinates for search
            soft_story_data.append({'coords': (coords[1], coords[0]), 'status': status})

            # Check if the property is in the tsunami hazard zone
            in_tsunami_zone = clipped_tsunami_zone.contains(point).any()

            # Check if the property is in the seismic hazard zone
            in_seismic_zone = seismic_hazard.contains(point).any()

            # Increment counters for hazard zones
            if in_tsunami_zone:
                tsunami_count += 1
            if in_seismic_zone:
                seismic_count += 1
            if in_tsunami_zone and in_seismic_zone:
                tsunami_and_seismic_count +=1

            # Add marker to the map
            folium.CircleMarker(
                location=[coords[1], coords[0]],  # GeoJSON coordinates are [lon, lat]
                radius=5,  # Radius of the circle
                color=color,
                fill=True,
                fill_color=color,
                fill_opacity=0.6,
                popup=f"Address: {feature['properties'].get('address', 'N/A')}<br>Status: {status}",  # Display address and status
            ).add_to(marker_cluster)
        #else:
            #st.write(f"Skipping a feature without valid geometry: {feature}")

    # Display hazard zone counts
    st.write(f"(NB: 7 Soft Story locations are missing from this map due to missing lat/long data in DataSF soft story csv. I need to fill in missing lat/long data based on address.)")
    st.write(f"Total soft story properties: {total_properties}")
    st.write(f"Soft story properties in the tsunami hazard zone: {tsunami_count} ({(tsunami_count / total_properties) * 100:.2f}% of total)")
    st.write(f"Soft story properties in the seismic hazard zone: {seismic_count} ({(seismic_count / total_properties) * 100:.2f}% of total)")
    st.write(f"Soft story properties in the tsunami and seismic hazard zone: {tsunami_and_seismic_count} ({(tsunami_and_seismic_count / total_properties) * 100:.2f}% of total)")



    # Address search functionality
    address = st.text_input("Enter an address to search:")
    if address:
        geolocator = Nominatim(user_agent="geo_search")
        try:
            location = geolocator.geocode(address, timeout=10)
            if location:
                user_coords = (location.latitude, location.longitude)

                # Add a red marker for the searched address
                folium.Marker(
                    location=user_coords,
                    popup="Searched Address",
                    icon=folium.Icon(color='red', icon='info-sign')
                ).add_to(m)

                # Check if the address is in San Francisco (using a bounding box check)
                sf_bounds = neighborhoods.total_bounds  # [minx, miny, maxx, maxy]
                if not (sf_bounds[0] <= user_coords[1] <= sf_bounds[2] and sf_bounds[1] <= user_coords[0] <= sf_bounds[3]):
                    st.write("This address does not exist in San Francisco.")
                    st_folium(m, width=700, height=500)
                    return

                # Check if the address is in the tsunami hazard zone
                point = Point(user_coords[1], user_coords[0])  # Note the order (lon, lat)
                in_tsunami_zone = clipped_tsunami_zone.contains(point).any()

                # Check if the address is in the seismic hazard zone
                in_seismic_zone = seismic_hazard.contains(point).any()

                # Display hazard zone results
                if in_tsunami_zone:
                    st.markdown("<p style='color:red;'>This address is in the tsunami hazard zone.</p>", unsafe_allow_html=True)
                else:
                    st.markdown("<p style='color:green;'>This address is not in the tsunami hazard zone.</p>", unsafe_allow_html=True)

                if in_seismic_zone:
                    st.markdown("<p style='color:red;'>This address is in the seismic hazard zone.</p>", unsafe_allow_html=True)
                else:
                    st.markdown("<p style='color:green;'>This address is not in the seismic hazard zone.</p>", unsafe_allow_html=True)

                # Find the closest match in the soft story data
                closest_match = None
                closest_status = None
                min_distance = float('inf')
                for data in soft_story_data:
                    distance = geodesic(user_coords, data['coords']).meters
                    if distance < min_distance:
                        min_distance = distance
                        closest_match = data['coords']
                        closest_status = data['status']

                if closest_match and min_distance < 10:  # Tighten the proximity threshold to 10 meters
                    st.markdown("<p style='color:red;'>This address is in the soft story property list.</p>", unsafe_allow_html=True)
                    # Additional line for compliance status
                    if closest_status == 'Non-Compliant':
                        st.markdown("<p style='color:red;'>This property is listed as non-compliant with SF Soft Story regulations.</p>", unsafe_allow_html=True)
                    else:
                        st.markdown("<p style='color:green;'>This property is listed as compliant with SF Soft Story regulations.</p>", unsafe_allow_html=True)
                else:
                    st.markdown("<p style='color:green;'>This address is not in the soft story property list.</p>", unsafe_allow_html=True)
            else:
                st.write("Address not found.")
        except Exception as e:
            st.write(f"Geocoding service is currently unavailable. Please try again later. Error: {e}")

    # Display the map using Streamlit
    st_folium(m, width=700, height=500)



