"""
Simple database checker to determine if ETL processes need to run.
Since the database data persists in the db-data volume, we only need to check
if the database tables have data.
"""

import logging
from sqlalchemy import text
from backend.database.session import get_db
from backend.api.models.liquefaction_zones import LiquefactionZone
from backend.api.models.soft_story_properties import SoftStoryProperty
from backend.api.models.tsunami import TsunamiZone


class DatabaseChecker:
    """
    Simple checker to see if database tables have data.
    Since db-data volume persists the database, we only need to check
    if tables are populated.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def has_data(self, table_class) -> bool:
        """
        Check if a database table has any data.

        Args:
            table_class: SQLAlchemy model class

        Returns:
            bool: True if table has data, False otherwise
        """
        try:
            db = next(get_db())
            count = db.query(table_class).count()
            has_data = count > 0

            self.logger.info(f"Table {table_class.__tablename__}: {count} records")
            return has_data

        except Exception as e:
            self.logger.error(f"Error checking table {table_class.__tablename__}: {e}")
            return False

    def needs_etl(self) -> bool:
        """
        Check if ETL processes need to run.
        Returns True if any critical table is empty.

        Returns:
            bool: True if ETL is needed, False otherwise
        """
        critical_tables = [LiquefactionZone, TsunamiZone]

        for table in critical_tables:
            if not self.has_data(table):
                self.logger.info(f"ETL needed - {table.__tablename__} is empty")
                return True

        self.logger.info("Database has data - ETL not needed")
        return False

    def get_table_stats(self) -> dict:
        """
        Get statistics about all tables.

        Returns:
            dict: Table statistics
        """
        stats = {}
        tables = [
            (LiquefactionZone, "liquefaction_zones"),
            (SoftStoryProperty, "soft_story_properties"),
            (TsunamiZone, "tsunami_zones"),
        ]

        for table_class, table_name in tables:
            try:
                db = next(get_db())
                count = db.query(table_class).count()
                stats[table_name] = {"count": count, "has_data": count > 0}
            except Exception as e:
                self.logger.error(f"Error getting stats for {table_name}: {e}")
                stats[table_name] = {"count": 0, "has_data": False, "error": str(e)}

        return stats


# Global database checker instance
db_checker = DatabaseChecker()
