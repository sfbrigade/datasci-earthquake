from fastapi import Depends, HTTPException, APIRouter
from ..tags import Tags
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from ..config import get_db
from ..models.addresses import Address  # SQLAlchemy model
from ..schemas.addresses import AddressResponse


router = APIRouter(
    prefix="/api/addresses",
    tags=[Tags.ADDRESSES],
)


@router.get("/{eas_fullid}", response_model=AddressResponse)
def get_address(eas_fullid: str, db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.eas_fullid == eas_fullid).first()
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return address
