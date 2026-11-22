import pycurl
import certifi
from io import BytesIO
import urllib
import json
import geopandas as gpd

CONFIG = {
  'tsunami': {
    'url': "https://services2.arcgis.com/zr3KAIbsRSUyARHG/ArcGIS/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0/query",
    'params': {
      "where": "County='San Francisco' AND Evacuate='Yes, Tsunami Hazard Area'",
      "outFields": "*",
      "f": "json",
    }
  },
  'liq': {
    'url': "https://data.sf.gov/resource/i4t7-35u3.geojson",
  },
  'earthquake': {
    'url': "https://services.arcgis.com/XG15cJAlne2vxtgt/ArcGIS/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query",
    'params': {
      "where": "STCOFIPS=06075",
      "outFields": "TRACTFIPS,ERQK_RISKS,ERQK_RISKR",
      "outSR": 4326,
      "geometryPrecision": 6,
      "f": "geojson" 
    }
  }
}

urls = {}
for k,v in CONFIG.items():
  url = v['url']
  if 'params' in v:
    url_params = urllib.parse.urlencode(v['params'])
    url = v['url'] + '?' + url_params
  urls[k] = url


dataframes = {}

c = pycurl.Curl()
for k,v in urls.items():
  buffer = BytesIO()
  c.setopt(c.URL, v)
  c.setopt(c.WRITEDATA, buffer)
  c.setopt(c.CAINFO, certifi.where())
  c.perform()
  c.reset()

  #body = buffer.getvalue()
  # Body is a byte string.
  # We have to know the encoding in order to print it to a text file
  # such as standard output.
  #resp = body.decode('iso-8859-1')

  #myjson = json.loads(resp)
  buffer.seek(0)
  dataframes[k] = gpd.read_file(buffer)
  dataframes[k].info(verbose=True)
c.close()


for k,v in dataframes.items():
  print(f'numb rows for {k} = {len(v)}')

sf_df = gpd.read_file('/backend/etl/data/sf_boundary.geojson')
print(f'len(sf_df) = {len(sf_df)}')
sf_df.info(verbose=True)

dataframes['tsunami'] = dataframes['tsunami'].to_crs(4326)

print(f'crs of tsunami = {dataframes["tsunami"].crs}')
print(f'crs of sf_df = {sf_df.crs}')
n = dataframes['tsunami']['geometry'].intersection(sf_df['geometry']).to_frame()
n.info(verbose=True)
print(f'len(n) = {len(n)}')
