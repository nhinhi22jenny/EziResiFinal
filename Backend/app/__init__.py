from flask import Flask
from .config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import pymysql
pymysql.install_as_MySQLdb()

db = SQLAlchemy()
migrate = Migrate()
jwt=JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    from .routes import register_blueprints
    register_blueprints(app)

    return app
