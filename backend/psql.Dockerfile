FROM postgres:15

# Install PostGIS and dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgis postgresql-15-postgis-3 \
    && rm -rf /var/lib/apt/lists/*


RUN echo 'doh' && pwd && ls -la /var/cache
RUN echo 'dohdoh' && pwd && ls -la /var/cache/apt
RUN echo 'dohdohdoh' && pwd && ls -la /var/cache/apt/archives

# Copy init scripts if necessary
COPY populate_db.sql . 

#RUN echo 'huh' && pwd && ls -l /usr/bin
#RUN echo 'huhhi' && echo $PATH 

CMD ["psql", "-f", "populate_db.sql", "postgresql://postgres:password@db:5432/qsdatabase"]
#CMD /bin/sh -c psql -f populate_db.sql postgresql://postgres:password@db:5432/qsdatabase 
#$DATABASE_URL_SQLALCHEMY 
