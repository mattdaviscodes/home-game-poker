import pytest
import click
from flask import Flask

from extensions import db, migrate, login_manager, bcrypt, scheduler, jwt


def create_app(config_object="settings"):
    """Create application factory, as explained here: http://flask.pocoo.org/docs/patterns/appfactories/.
    :param config_object: The configuration object to use.
    """
    app = Flask(__name__.split(".")[0])
    app.config.from_object(config_object)
    register_extensions(app)
    return app


def register_extensions(app):
    """Register Flask extensions."""
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    if not scheduler.running:
        scheduler.init_app(app)
        scheduler.start()
    jwt.init_app(app)


app = create_app()

# Needs to import after app creation to avoid circular import errors
from views import *
from models import *


@app.shell_context_processor
def make_shell_context():
    return {
        "db": db,
        "Group": Group,
        "PaymentType": PaymentType,
        "Payment": Payment,
        "Role": Role,
        "User": User,
        "Transaction": Transaction,
        "Table": Table,
        "Player": Player,
        "Hand": Hand,
        "Pot": Pot,
        "BettingRound": BettingRound,
        "Bet": Bet,
        "Holding": Holding,
        "Card": Card,
        "Action": Action,
        "State": State,
        "PotState": PotState
    }


@app.cli.command()
@click.argument("path", default="tests")
def test(path):
    pytest.main(["-v", "-n", "auto", "-p", "no:warnings", path])
