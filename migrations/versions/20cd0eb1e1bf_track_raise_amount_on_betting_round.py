"""Track raise amount on betting round

Revision ID: 20cd0eb1e1bf
Revises: 24c31d11173d
Create Date: 2019-09-23 05:28:48.499473

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20cd0eb1e1bf'
down_revision = '24c31d11173d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('betting_rounds', sa.Column('raise_amt', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('betting_rounds', 'raise_amt')
    # ### end Alembic commands ###
