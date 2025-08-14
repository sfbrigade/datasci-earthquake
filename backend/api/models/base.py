from sqlalchemy.orm import DeclarativeBase
from typing import TypeVar


class Base(DeclarativeBase):
    pass


ModelType = TypeVar("ModelType", bound=DeclarativeBase)
