from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_sse import sse
from flask_login import LoginManager
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
bcrypt = Bcrypt()