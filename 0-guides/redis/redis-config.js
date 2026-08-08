
👉 Install redis server
sudo apt update
sudo apt install redis-server -y
sudo systemctl status redis-server

👉 set redis pasword-------------------------------------------
sudo nano /etc/redis/redis.conf

requirepass 11130113

//set redis memory
sudo nano /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru //remove old cache when ram is full




👉 CLI
CONFIG GET *  //all config
CONFIG GET maxmemory  //get maxmemory
exapmle CONFIG SET maxmemory 4gb
redis-cli -a 11130113
scan 0

DEL "key"
fluahall

RAM sınırı (en önemli)
TTL kullan
Key naming düzgün yap
KEYS * kullanma
pipeline ile performans artır
