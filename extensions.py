from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_sse import sse

db = SQLAlchemy()
migrate = Migrate()