from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.declarative import DeclarativeMeta
from typing import TypeVar


class Base(DeclarativeBase):
    pass


ModelType = TypeVar("ModelType", bound=DeclarativeBase)
