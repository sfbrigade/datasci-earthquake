"""Router to get addresses"""

from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from backend.database.session import get_db
from ..models.addresses import Address  # SQLAlchemy model
from ..schemas.addresses_schemas import (
    AddressFeature,
    AddressFeatureCollection,
)


router = APIRouter(
    prefix="/api/addresses",
    tags=[Tags.ADDRESSES],
)


@router.get("/{eas_fullid}", response_model=AddressFeature)
async def get_address_by_id(eas_fullid: str, db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.eas_fullid == eas_fullid).first()
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return AddressFeature.from_sqlalchemy_model(address)


@router.get("/", response_model=AddressFeatureCollection)
async def get_all_addresses(db: Session = Depends(get_db)):
    # Query the database for all addresses
    addresses = db.query(Address).all()
    print(f"Fetched {len(addresses)} addresses")  # Debugging

    # If no addresses are found, raise a 404 error
    if not addresses:
        raise HTTPException(status_code=404, detail="No addresses found")

    # Convert each address into the AddressResponse and create the FeatureCollection
    features = [AddressFeature.from_sqlalchemy_model(address) for address in addresses]
    # Return FeatureCollection
    return AddressFeatureCollection(type="FeatureCollection", features=features)
