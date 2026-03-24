# Dockerfile

# Use the official PostgreSQL image
FROM postgres:15

#WORKDIR /haha

RUN echo 'kitbanana' && ls -l /etc/apt/sources.list.d


RUN echo 'kombucha' \ 
    && apt-get update && apt-get install -d -y --no-install-recommends \
    postgis postgresql-15-postgis-3 

#RUN apt update && apt download postgis postgresql-15-postgis-3

#RUN echo 'oopsies1' && pwd && ls -l
#RUN echo 'dupdap' && du -h
#RUN apt install -y ./postgis_3.6.2+dfsg-1.pgdg13+1_amd64.deb

RUN echo 'winner1' && pwd && ls -l /var/cache
RUN echo 'winner2' && pwd && ls -l /var/cache/apt
RUN echo 'beforefasty' && pwd && ls -l /var/cache/apt/archives
RUN echo 'winner4' && pwd && ls -l /var/cache/apt/archives/partial

RUN dpkg -i /var/cache/apt/archives/*.deb

RUN echo 'afterfasty1' && pwd && ls -l /var/cache/apt/archives
RUN echo 'afterfasty2' && du -h /var/cache/apt/archives
#RUN echo 'duh1' && du -h /var/lib/apt/lists
#RUN echo 'duh2' && ls -l /var/lib/apt
#RUN echo 'duh3' && ls -l /var/lib/apt/lists


# Start the database server with PostGIS enabled
CMD ["postgres"]
