"""deleted_addresses_and_seismic

Revision ID: 6b7656592b34
Revises: bd6fcff4f17f
Create Date: 2025-02-08 18:50:39.104327

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "6b7656592b34"
down_revision: Union[str, None] = "bd6fcff4f17f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_geospatial_index(
        "idx_seismic_hazard_zones_geometry",
        table_name="seismic_hazard_zones",
        postgresql_using="gist",
        column_name="geometry",
    )
    op.drop_geospatial_table("seismic_hazard_zones")
    op.drop_geospatial_index(
        "idx_addresses_point",
        table_name="addresses",
        postgresql_using="gist",
        column_name="point",
    )
    op.drop_geospatial_table("addresses")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_geospatial_table(
        "addresses",
        sa.Column("eas_fullid", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("address", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("unit_number", sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column("address_number", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column("street_name", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("street_type", sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column("parcel_number", sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column("block", sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column("lot", sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column("cnn", sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column(
            "longitude",
            sa.DOUBLE_PRECISION(precision=53),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "latitude",
            sa.DOUBLE_PRECISION(precision=53),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("zip_code", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column(
            "point",
            Geometry(
                geometry_type="POINT",
                srid=4326,
                spatial_index=False,
                from_text="ST_GeomFromEWKT",
                name="geometry",
                nullable=False,
                _spatial_index_reflected=True,
            ),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "supdist", sa.VARCHAR(length=255), autoincrement=False, nullable=True
        ),
        sa.Column("supervisor", sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column(
            "supname", sa.VARCHAR(length=255), autoincrement=False, nullable=True
        ),
        sa.Column("nhood", sa.VARCHAR(length=255), autoincrement=False, nullable=False),
        sa.Column(
            "sfdata_as_of",
            postgresql.TIMESTAMP(timezone=True),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "created_timestamp",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "update_timestamp",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("eas_fullid", name="addresses_pkey"),
    )
    op.create_geospatial_index(
        "idx_addresses_point",
        "addresses",
        ["point"],
        unique=False,
        postgresql_using="gist",
        postgresql_ops={},
    )
    op.create_geospatial_table(
        "seismic_hazard_zones",
        sa.Column("identifier", sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column(
            "geometry",
            Geometry(
                geometry_type="MULTIPOLYGON",
                srid=4326,
                spatial_index=False,
                from_text="ST_GeomFromEWKT",
                name="geometry",
                nullable=False,
                _spatial_index_reflected=True,
            ),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "update_timestamp",
            postgresql.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            autoincrement=False,
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("identifier", name="seismic_hazard_zones_pkey"),
    )
    op.create_geospatial_index(
        "idx_seismic_hazard_zones_geometry",
        "seismic_hazard_zones",
        ["geometry"],
        unique=False,
        postgresql_using="gist",
        postgresql_ops={},
    )
    # ### end Alembic commands ###
