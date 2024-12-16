"""Router to handle address-related API endpoints"""

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
    prefix="/addresses",
    tags=[Tags.ADDRESSES],
)


@router.get("/{eas_fullid}", response_model=AddressFeature)
async def get_address_by_id(eas_fullid: str, db: Session = Depends(get_db)):
    """
    Retrieve a single address by its ID.

    Args:
        eas_fullid (str): The unique identifier for the address.
        db (Session): The database session dependency.

    Returns:
        AddressFeature: The address details as a GeoJSON Feature.

    Raises:
        HTTPException: If the address is not found (404 error).
    """
    address = db.query(Address).filter(Address.eas_fullid == eas_fullid).first()
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return AddressFeature.from_sqlalchemy_model(address)


@router.get("/", response_model=AddressFeatureCollection)
async def get_all_addresses(db: Session = Depends(get_db)):
    """
    Retrieve all addresses from the database.

    Args:
        db (Session): The database session dependency.

    Returns:
        AddressFeatureCollection: A collection of all addresses as GeoJSON Features.

    Raises:
        HTTPException: If no addresses are found (404 error).
    """
    # Query the database for all addresses
    addresses = db.query(Address).all()

    # If no addresses are found, raise a 404 error
    if not addresses:
        raise HTTPException(status_code=404, detail="No addresses found")

    # Convert each address into the AddressResponse and create the FeatureCollection
    features = [AddressFeature.from_sqlalchemy_model(address) for address in addresses]
    # Return FeatureCollection
    return AddressFeatureCollection(type="FeatureCollection", features=features)
