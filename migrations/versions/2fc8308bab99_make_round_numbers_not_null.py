"""make round numbers not null

Revision ID: 2fc8308bab99
Revises: d035812ab87f
Create Date: 2019-08-14 06:21:44.457517

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2fc8308bab99'
down_revision = 'd035812ab87f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('betting_rounds', 'round_num',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('hands', 'rounds',
               existing_type=sa.INTEGER(),
               nullable=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('hands', 'rounds',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.alter_column('betting_rounds', 'round_num',
               existing_type=sa.INTEGER(),
               nullable=True)
    # ### end Alembic commands ###
