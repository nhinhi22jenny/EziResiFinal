import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "slv*!c9oyrq#d4g4vq5*)#c!8v$&yn!t1r2ld9)9+&-$f_plxm"
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:nhinhinhi@localhost:3306/mydatabase'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
