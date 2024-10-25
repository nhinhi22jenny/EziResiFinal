# SQLAlchemy Models for this project database setup
# Defines the structure of the database tables and relationships.

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash
from app import db

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255))
    user_type = db.Column(db.Enum('migrant', 'agent', 'provider', 'admin'), nullable=False)
   

    # Relationships
    migrant_profile = db.relationship('MigrantProfile', back_populates='user', uselist=False, cascade="all, delete-orphan")
    migration_agent = db.relationship('MigrationAgent', back_populates='user', uselist=False, cascade="all, delete-orphan")
    education_provider = db.relationship('EducationProvider', back_populates='user', uselist=False, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
  

class MigrantProfile(db.Model):
    __tablename__ = 'migrant_profiles'
    
    profile_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    skills = db.Column(db.Text)
    occupation= db.Column(db.String(255),nullable=True)
    experience_years = db.Column(db.Integer)
    english_proficiency = db.Column(db.Enum('basic', 'intermediate', 'advanced', 'fluent'))
    location_preference = db.Column(db.String(255))

    # Relationships
    user = db.relationship('User', back_populates='migrant_profile')
    recommendations = db.relationship('Recommendation', back_populates='migrant_profile', cascade="all, delete-orphan")

class MigrationAgent(db.Model):
    __tablename__ = 'migration_agents'
    
    agent_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    agency_name = db.Column(db.String(255))

    # Relationships
    user = db.relationship('User', back_populates='migration_agent')

class EducationProvider(db.Model):
    __tablename__ = 'education_providers'
    
    provider_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    institution_name = db.Column(db.String(255))
    institution_location = db.Column(db.String(255))

    # Relationships
    user = db.relationship('User', back_populates='education_provider')
    courses = db.relationship('Course', back_populates='provider',cascade="all, delete-orphan")

class Course(db.Model):
    __tablename__ = 'courses'
    
    course_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('education_providers.provider_id'), nullable=False)
    course_name = db.Column(db.String(255))
    course_duration_years = db.Column(db.Numeric(5, 1))
    course_cost = db.Column(db.Numeric(10, 2))

    # Relationships
    provider = db.relationship('EducationProvider', back_populates='courses')
    recommendations = db.relationship('Recommendation', back_populates='course', cascade="all, delete-orphan")

class SkilledOccupationList(db.Model):
    __tablename__ = 'skilled_occupation_list'
    
    occupation_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    occupation_name = db.Column(db.String(255), nullable=False)
    occupation_code = db.Column(db.String(50))
   

class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    
    recommendation_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('migrant_profiles.profile_id'), nullable=False)
    # occupation_id = db.Column(db.Integer, db.ForeignKey('skilled_occupation_list.occupation_id'))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'))
    # pr_probability = db.Column(db.Numeric(5, 2))
    # estimated_cost = db.Column(db.Numeric(10, 2))
    # estimated_duration_years = db.Column(db.Numeric(3, 1))
    # recommendation_rank = db.Column(db.Integer)
   

    # Relationships
    migrant_profile = db.relationship('MigrantProfile', back_populates='recommendations')
    # occupation = db.relationship('SkilledOccupationList')
    course = db.relationship('Course')
