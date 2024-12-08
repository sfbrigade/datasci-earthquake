from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from backend.database.session import get_db
from ..models.addresses import Address  # SQLAlchemy model
from ..schemas.addresses import (
    AddressResponse,
    AddressFeatureCollection,
)
from backend.api.schemas.base_geojson_models import FeatureCollectionModel, FeatureModel


router = APIRouter(
    prefix="/api/addresses",
    tags=[Tags.ADDRESSES],
)


@router.get("/{eas_fullid}", response_model=AddressResponse)
def get_address_by_id(eas_fullid: str, db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.eas_fullid == eas_fullid).first()
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return AddressResponse.from_sqlalchemy_model(address)


@router.get("/", response_model=FeatureCollectionModel)
def get_all_addresses(db: Session = Depends(get_db)):
    # Query the database for all addresses
    """addresses = db.query(Address).limit(5).all()
    print(f"Fetched {len(addresses)} addresses")  # Debugging

    # If no addresses are found, raise a 404 error
    if not addresses:
        raise HTTPException(status_code=404, detail="No addresses found")

    # Convert each address into the AddressResponse and create the FeatureCollection
    #features = [AddressResponse.from_sqlalchemy_model(address) for address in addresses]
    features = []
    for address in addresses:
        try:
            a = AddressResponse.from_sqlalchemy_model(address)
            features.append(a)
            print(a)
        except Exception as e:
            print(f"Error processing address {address.eas_fullid}: {e}")  # Debugging
    feature_collection = FeatureCollectionModel(type="FeatureCollection", features=features)
    print("Feature Collection:", feature_collection)
    return feature_collection"""

    """sample_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [37.751869, -122.405675]},
                "properties": {"eas_fullid": "test-id", "address": "test-address"},
            }
        ],
    }
    validated_response = AddressesResponse(**sample_data)
    print("Validated Response dict:", validated_response.to_dict())
    return validated_response.to_dict()"""

    sample_data = [
        {
            "type": "Feature",
            "geometry_type": "Point",
            "coordinates": (37.751869, -122.405675),
            "eas_fullid": "test-id-1",
            "address": "1234 Test Street",
        },
        {
            "type": "Feature",
            "geometry_type": "Point",
            "coordinates": (37.788435, -122.420113),
            "eas_fullid": "test-id-2",
            "address": "5678 Sample Road",
        },
    ]

    # Return FeatureCollection
    return AddressFeatureCollection(type="FeatureCollection", features=sample_data)
