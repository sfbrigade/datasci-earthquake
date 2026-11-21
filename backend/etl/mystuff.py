import pycurl
import certifi
from io import BytesIO
import urllib
import json


TSUNAMI_URL = "https://services2.arcgis.com/zr3KAIbsRSUyARHG/ArcGIS/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0/query"
params = {
  "where": "County='San Francisco' AND Evacuate='Yes, Tsunami Hazard Area'",
  "outFields": "*",
  "f": "json",
}
formatted = urllib.parse.urlencode(params)
TSUNAMI_URL = TSUNAMI_URL + '?' + formatted
print(f'TSUNAMI_URL = {TSUNAMI_URL}')



urls = []

#_LIQUEFACTION_URL = "https://data.sfgov.org/resource/i4t7-35u3.geojson"
_LIQUEFACTION_URL = "https://data.sf.gov/resource/i4t7-35u3.geojson"

_NRI_CENSUS_TRACTS_URL = (
    "https://services.arcgis.com/XG15cJAlne2vxtgt/ArcGIS/rest/services/"
    "National_Risk_Index_Census_Tracts/FeatureServer/0/query"
)
_SF_STCOFIPS = "06075"


params = {
  "where": f"STCOFIPS='{_SF_STCOFIPS}'",
  "outFields": "TRACTFIPS,ERQK_RISKS,ERQK_RISKR",
  "outSR": 4326,
  "geometryPrecision": 6,
  "f": "geojson" 
}
formatted = urllib.parse.urlencode(params)
_NRI_CENSUS_TRACTS_URL = _NRI_CENSUS_TRACTS_URL + '?' + formatted

urls.append(TSUNAMI_URL)
urls.append(_LIQUEFACTION_URL)
urls.append(_NRI_CENSUS_TRACTS_URL)

for url in urls:
  buffer = BytesIO()
  c = pycurl.Curl()
  c.setopt(c.URL, url)
  c.setopt(c.WRITEDATA, buffer)
  c.setopt(c.CAINFO, certifi.where())
  c.perform()
  full_url = c.getinfo(pycurl.EFFECTIVE_URL)
  c.close()

  body = buffer.getvalue()
  # Body is a byte string.
  # We have to know the encoding in order to print it to a text file
  # such as standard output.
  resp = body.decode('iso-8859-1')

  print(f'...loading json for {url}')
  myjson = json.loads(resp)
  print(f'type of myjson = {type(myjson)}')
  for k,v in myjson.items():
    print(f'key = {k}')

