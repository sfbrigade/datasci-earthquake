# Dockerfile

# Use the official PostgreSQL image
FROM postgres:15

WORKDIR /haha
#RUN echo 'kombucha' \ 
#    && apt-get update && apt-get install -d -y --no-install-recommends \
#    postgis postgresql-15-postgis-3 

RUN apt update && apt download postgis postgresql-15-postgis-3

RUN echo 'oopsies' && pwd && ls -l
RUN echo 'dupdap' && du -h

#RUN echo 'ocrazysteak1' && pwd && ls -l var/cache
#RUN echo 'ocrazysteak2' && pwd && ls -l var/cache/apt
#RUN echo 'ocrazysteak3' && pwd && ls -l var/cache/apt/archives
#RUN echo 'ocrazysteak4' && pwd && ls -l var/cache/apt/archives/partial


#RUN echo 'fasty1' && du -sh var/cache/apt
#RUN echo 'fasty2' && du -sh var/cache/apt/archives
#RUN echo 'duh0' && du -sh var/lib/apt
#RUN echo 'duh1' && du -sh var/lib/apt/lists
#RUN echo 'duh2' && ls -l var/lib/apt
#RUN echo 'duh3' && ls -l var/lib/apt/lists


# Start the database server with PostGIS enabled
CMD ["postgres"]
