# Dockerfile

# Use the official PostgreSQL image
FROM postgres:15


RUN echo 'kombucha' \ 
    && apt-get install -d \
    postgis postgresql-15-postgis-3 

RUN echo 'crazysteak1' && pwd && ls -l var/cache
RUN echo 'crazysteak2' && pwd && ls -l var/cache/apt
RUN echo 'crazysteak3' && pwd && ls -l var/cache/apt/archives
RUN echo 'crazysteak4' && pwd && ls -l var/cache/apt/archives/partial


# Start the database server with PostGIS enabled
CMD ["postgres"]
