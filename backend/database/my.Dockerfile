# Dockerfile

# Use the official PostgreSQL image
FROM postgres:15


RUN echo 'kombucha' \ 
    && apt-get update && apt-get install -d -y --no-install-recommends \
    postgis postgresql-15-postgis-3 

RUN echo 'ocrazysteak1' && pwd && ls -l var/cache
RUN echo 'ocrazysteak2' && pwd && ls -l var/cache/apt
RUN echo 'ocrazysteak3' && pwd && ls -l var/cache/apt/archives
RUN echo 'ocrazysteak4' && pwd && ls -l var/cache/apt/archives/partial


RUN echo 'fasty1' && du -sh var/cache/apt
RUN echo 'fasty2' && du -sh var/cache/apt/archives


# Start the database server with PostGIS enabled
CMD ["postgres"]
