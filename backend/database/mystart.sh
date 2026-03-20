echo 'hiiii' 
pg_dump --data-only --inserts -h db -U postgres -f haha/myiii.sql -t liquefaction_zones qsdatabase 
echo 'dddone' 
ls -la && pwd 
echo 'starting postgres ----------'
postgres  
