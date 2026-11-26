import pycurl
import certifi
from io import BytesIO
import urllib
import json
import geopandas as gpd
from geoalchemy2.shape import from_shape, to_shape


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
  print(f'curling {k}....')
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
n = dataframes['tsunami']['geometry'].intersection(sf_df['geometry']).to_frame(name="geometry")
#n['geometry'] = n['geometry'].to_wkt()
n['identifier'] = dataframes['tsunami']['OBJECTID']
n['evacuate'] = dataframes['tsunami']['Evacuate']
n['county'] = dataframes['tsunami']['County']
n['global_id'] = dataframes['tsunami']['GlobalID']
n['shape_length'] = dataframes['tsunami']['Shape__Length']
n['shape_area'] = dataframes['tsunami']['Shape__Area']

n.info(verbose=True)
print(f'len(n) = {len(n)}')

from backend.database.session import get_engine 
engine = get_engine()
from sqlalchemy import text


from psycopg.types import TypeInfo
from psycopg.types.shapely import register_shapely

# test 1
#connection = engine.connect()
#dbapi_conn = connection.connection
#print(f'type of dbapi conn = {type(dbapi_conn)}')
#info = TypeInfo.fetch(dbapi_conn, "geometry")
#dbapi_conn.close()

# test 2
#c = engine.raw_connection()
#info = TypeInfo.fetch(c, "geometry")
#print(f'type of rawok = {type(c)}')
#c.close()

# test 3 
#with engine.raw_connection() as c:
#  print(f'type of raw = {type(c)}')
#  info = TypeInfo.fetch(c, "geometry")

from sqlalchemy import table, column, insert, select
from sqlalchemy import Table, Column, Double, Integer, String, ForeignKey
from sqlalchemy.orm import registry

mapper_registry = registry()

def dothis(ztable, conn, keys, data_iter):
  #mytable = table(
  #  ztable.name
  #)
  mytable = Table(
    ztable.name,
    mapper_registry.metadata,
    Column("identifier", Integer, primary_key=True),
    Column("evacuate", String(1000)),
    Column("county", String(1000)),
    Column("global_id", String(1000)),
    Column("shape_length", Double),
    Column("shape_area", Double)
  )

  print(f'type of conn in dothis = {type(conn)}')
  print(f'type of keys in dothis = {type(keys)}')
  print(f'type of table in dothis = {type(table)}')
  for i,k in enumerate(keys):
    print(f'{i}... = {k}')
    if k != 'index':
      mytable.append_column(column(k))
  print(f'type of data_iter in dothis = {type(data_iter)}')
  ind= 1
  for t in data_iter:
    print(f'the tuple = {t}')
    values = dict(tuple(item for item in zip(keys, t) if item[0] != 'index'))
    aa = values['geometry']
    print(f'type of AA before = {type(aa)}')
    values['geometry'] = from_shape(values['geometry'], srid=4326)
    print(f'type of AA after = {type(values["geometry"])}')
    del values['geometry']
    print(f'values = {values}')
    stmt = insert(mytable).values(values)  
    print(stmt)
    conn.execute(stmt)
    conn.commit()

with engine.begin() as connection:
  #info = TypeInfo.fetch(connection, "geometry")
  #register_shapely(info, connection)
  n.to_sql(name='tsunami_zones', con=connection, method=dothis, if_exists='delete_rows')

#with engine.connect() as connection:
#  result = connection.execute(text("select * from tsunami_zones"))
#  for row in result:
#    print("AFTER: identifier:", row.identifier)

#with engine.connect() as connection:
#  result = connection.execute(text("select column_name, data_type from information_schema.columns where table_name = 'tsunami_zones'"))
#  for row in result:
#    print("name:", row.column_name)
#    print("type:", row.data_type)
#    print("--------")

