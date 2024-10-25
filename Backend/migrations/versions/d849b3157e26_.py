"""empty message

Revision ID: d849b3157e26
Revises: 
Create Date: 2024-08-25 16:18:41.075237

"""

# setup for the database schema of this platform using alembic and sqlalchemy


from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd849b3157e26'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('skilled_occupation_list',
    sa.Column('occupation_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('occupation_name', sa.String(length=255), nullable=False),
    sa.Column('occupation_code', sa.String(length=50), nullable=True),
    sa.PrimaryKeyConstraint('occupation_id')
    )
    op.create_table('users',
    sa.Column('user_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('full_name', sa.String(length=255), nullable=True),
    sa.Column('user_type', sa.Enum('migrant', 'agent', 'provider', 'admin'), nullable=False),
    sa.PrimaryKeyConstraint('user_id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('education_providers',
    sa.Column('provider_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('institution_name', sa.String(length=255), nullable=True),
    sa.Column('institution_location', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
    sa.PrimaryKeyConstraint('provider_id')
    )
    op.create_table('migrant_profiles',
    sa.Column('profile_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('skills', sa.Text(), nullable=True),
    sa.Column('experience_years', sa.Integer(), nullable=True),
    sa.Column('english_proficiency', sa.Enum('basic', 'intermediate', 'advanced', 'fluent'), nullable=True),
    sa.Column('location_preference', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
    sa.PrimaryKeyConstraint('profile_id')
    )
    op.create_table('migration_agents',
    sa.Column('agent_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('agency_name', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
    sa.PrimaryKeyConstraint('agent_id')
    )
    op.create_table('courses',
    sa.Column('course_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('provider_id', sa.Integer(), nullable=False),
    sa.Column('course_name', sa.String(length=255), nullable=True),
    sa.Column('course_duration_years', sa.Numeric(precision=3, scale=1), nullable=True),
    sa.Column('course_cost', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.ForeignKeyConstraint(['provider_id'], ['education_providers.provider_id'], ),
    sa.PrimaryKeyConstraint('course_id')
    )
    op.create_table('recommendations',
    sa.Column('recommendation_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('profile_id', sa.Integer(), nullable=False),
    sa.Column('occupation_id', sa.Integer(), nullable=True),
    sa.Column('course_id', sa.Integer(), nullable=True),
    sa.Column('pr_probability', sa.Numeric(precision=5, scale=2), nullable=True),
    sa.Column('estimated_cost', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('estimated_duration_years', sa.Numeric(precision=3, scale=1), nullable=True),
    sa.Column('recommendation_rank', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['course_id'], ['courses.course_id'], ),
    sa.ForeignKeyConstraint(['occupation_id'], ['skilled_occupation_list.occupation_id'], ),
    sa.ForeignKeyConstraint(['profile_id'], ['migrant_profiles.profile_id'], ),
    sa.PrimaryKeyConstraint('recommendation_id')
    )
    # ### end Alembic commands ###

# The downgrade() function reverses the changes by dropping all the tables. 
# This ensures that the migration is reversible, allowing for smooth rollbacks if needed.

def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('recommendations')
    op.drop_table('courses')
    op.drop_table('migration_agents')
    op.drop_table('migrant_profiles')
    op.drop_table('education_providers')
    op.drop_table('users')
    op.drop_table('skilled_occupation_list')
    # ### end Alembic commands ###