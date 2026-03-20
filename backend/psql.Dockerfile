FROM postgres:15

# Install PostGIS and dependencies
#RUN apt-get update \
#    && apt-get install -y --no-install-recommends \
#    postgis postgresql-15-postgis-3 \
#    && rm -rf /var/lib/apt/lists/*

# Copy init scripts if necessary
COPY populate_db.sql . 

CMD /bin/sh -c psql -f populate_db.sql \c $DATABASE_URL_SQLALCHEMY 
