from fastapi import Depends, APIRouter
from ..tags import Tags
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from ..config import get_db
from ..models.addresses import Address  # SQLAlchemy model


router = APIRouter(
    prefix="/api/addresses",
    tags=[Tags.ADDRESSES],
)


@router.get("/addresses/{eas_fullid}")
async def get_address(eas_fullid, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Address).where(Address.eas_fullid == eas_fullid))
    address = result.scalars().first()
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return address
