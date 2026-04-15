👉 CHECK USER
mongosh
use admin
db.getUsers()


👉️CREATE USER AND GIVE ROOT ROLE
mongosh -> 
use admin //ROOT ROLE MUST TAKE ADMIN DATABASE
db.createUser(
  {
    user: 'mesto',
    pwd:  'mk1972mk',
    roles: [{role:"root", db:"admin"}]
	
  }
)
👉️TO SUPERADMIN ROLE
mongosh -> 
use admin
db.createUser(
  {
    user: 'Boss',
    pwd:  'mk1972mk',
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, 'readWriteAnyDatabase'] 
  }
)
👉️FOR DIFFERENT DATABASE
mongosh
use dbName
db.createUser(
  {
    user: 'blog',
    pwd:  'mk1972mk',
    roles: [{role:"readWrite", db:"blog"}]
	
  }
)

👉️UPDATE USER
use dbName
db.updateUser('username',{
    pwd: '123'
  }
)

👉️UPDATE USER FOR MULTIPLE DATABASE AND ROLE
use dbName
db.updateUser('username',{
    roles: [
    	{role:"readWrite", db:"bet"},
    	{role:"readWrite", db:"crud"}
    ]
	
  }
)

👉️DELETE USER
use dbName
db.dropUser('username')



👉️AUTH
after created user close mongosh and 
open -> sudo nano /etc/mongod.conf
remove # for both lines second line must have tab
security:
  authorization: enabled
  
sudo systemctl restart mongod
or
systemctl start mongod

than
mongosh -u 'mesto' -p '11130113' --authenticationDatabase admin

or in mongosh to login use this
db.auth('username','password')
db.changeUserPassword('username','newpassword')
finished

