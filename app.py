import streamlit as st

from streamlit_folium import st_folium
import pages.the_map as the_map



# Page configuration
st.set_page_config(
    page_title="Quake Safe Prototype",
    page_icon=":bridge:",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Define the pages

# Sidebar navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Map"])

# Page selection logic
if page == "Map":
    the_map.show()
# elif page == "About":
#     about()
# elif page == "Contact":
#     contact()

# Footer
st.sidebar.markdown(
    """
    ---
    Created with Streamlit.
    """
)
