"""Updated

Revision ID: 1bbdd2e2e0b5
Revises: 383b62b73e97
Create Date: 2024-08-25 21:39:58.291860

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1bbdd2e2e0b5'
down_revision = '383b62b73e97'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('migrant_profiles', schema=None) as batch_op:
        batch_op.add_column(sa.Column('occupation', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('migrant_profiles', schema=None) as batch_op:
        batch_op.drop_column('occupation')

    # ### end Alembic commands ###
