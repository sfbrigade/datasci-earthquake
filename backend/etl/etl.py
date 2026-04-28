import asyncio
import logging
import os
import sys 
import time

from backend.api.models.tsunami import TsunamiZone
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.etl.tsunami_data_handler import TsunamiDataHandler
from backend.etl.liquefaction_data_handler import LiquefactionDataHandler
from backend.etl.soft_story_properties_data_handler import SoftStoryPropertiesDataHandler
from requests import RequestException

HANDLERS = {
    'tsunami': {
        'handler': TsunamiDataHandler('https://services2.arcgis.com/zr3KAIbsRSUyARHG/ArcGIS/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0/query', TsunamiZone),
        'params': {
            "where": "County='San Francisco' AND Evacuate='Yes, Tsunami Hazard Area'",
            "outFields": "*",
            "f": "json",
        },
        'pk': 'identifier' 
    },
    'liquefaction': {
        'handler': LiquefactionDataHandler('https://data.sfgov.org/resource/i4t7-35u3.geojson', LiquefactionZone),
        'params': None,
        'pk': 'identifier' 
    },
    'soft_story': {
        'handler': SoftStoryPropertiesDataHandler(
            'https://data.sfgov.org/resource/beah-shgi.geojson',
            SoftStoryProperty,
            mapbox_api_key=os.environ["NEXT_PUBLIC_MAPBOX_TOKEN"]
        ),
        'params': None,
        'pk': 'address' 
    }
}

logger = logging.getLogger(__name__)
FORMAT = '%(asctime)s %(thread)d %(levelname)s : line %(lineno)d : %(message)s'
logging.basicConfig(level=logging.INFO, format=FORMAT)

async def etl(key):
  handler = HANDLERS[key]['handler']

  try:
      if HANDLERS[key]['params'] != None:
        data = handler.fetch_data(HANDLERS[key]['params'])
      else:
        data = handler.fetch_data()
      if key == 'soft_story' or key == 'liquefaction':
        raise RequestException('oh boy!')
      zones_objects, zones_geojson = handler.parse_data(data)
      handler.export_geojson_if_changed(zones_geojson)
      handler.bulk_insert_data(zones_objects, HANDLERS[key]['pk'])
  except RequestException as e:
      logger.error(f'ETL (fetching data) for {key} failed due to {type(e)} {e}')
      raise
  except Exception as e:
      logger.error(f'ETL for {key} failed due to {type(e)} {e}')
      raise



async def main():
  start = time.perf_counter()
  res = await asyncio.gather(
      etl('tsunami'),
      etl('liquefaction'),
      etl('soft_story'),
      return_exceptions=True)
  end = time.perf_counter()
  logger.info('------ RESULTS ------')
  logger.info(f'duration: {end-start} sec')
  logger.info(res)
  if any(isinstance(r, Exception) for r in res):
      sys.exit(1)

asyncio.run(main())


