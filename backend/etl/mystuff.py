import pycurl
import certifi
from io import BytesIO

buffer = BytesIO()
c = pycurl.Curl()


TSUNAMI_URL = "https://services2.arcgis.com/zr3KAIbsRSUyARHG/ArcGIS/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0/query"
params = {
  "where": "County='San Francisco' AND Evacuate='Yes, Tsunami Hazard Area'",
  "outFields": "*",
  "f": "json",
}
formatted = '&'.join(f'{k}={v} for k,v in params.items()')

TSUNAMI_URL = TSUNAMI_URL + '?' + formatted
print(f'TSUNAMI_URL = {TSUNAMI_URL}')

#c.setopt(c.URL, 'https://pycurl.github.io/')
#c.setopt(c.WRITEDATA, buffer)
#c.setopt(c.CAINFO, certifi.where())
#c.perform()
#c.close()

#body = buffer.getvalue()
# Body is a byte string.
# We have to know the encoding in order to print it to a text file
# such as standard output.
#print(body.decode('iso-8859-1'))
