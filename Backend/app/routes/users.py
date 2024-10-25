from flask import Blueprint, jsonify, request
from app.models import  User,MigrantProfile,Recommendation,Course
from app import db
from sqlalchemy import func,text
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from collections import Counter
from flask_cors import cross_origin



users_bp = Blueprint('user_bp', __name__,url_prefix='/users')

@users_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Hello, World!'})

@users_bp.route('/register', methods=['POST'])
@cross_origin()
def signup():
    data=request.get_json()
    email=data.get('email')
    password=data.get('password')
    full_name=data.get('full_name')
    user_type=data.get('user_type')

    # Validate input data
    if not all([email, password, full_name, user_type]):
        return jsonify({"msg": "Missing fields"}), 400

    if user_type not in ['migrant', 'agent', 'provider','admin']:
        return jsonify({"msg": "Invalid user type"}), 400
    # Check if the email is already registered
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User with this email already exists"}), 400

    # Create a new user instance
    new_user = User(
        email=email,
        full_name=full_name,
        user_type=user_type,
        password_hash=generate_password_hash(password)
    )
    try:
    # Save the new user to the database
        db.session.add(new_user)
    except Exception as e:
        return jsonify({"msg": "An error occurred while creating the user"}), 500
    db.session.commit()

    # Create a JWT access token
    access_token = create_access_token(identity=new_user.user_id)

    # Return the user details and token
    return jsonify({
        "msg": "User created successfully",
        "token": access_token,
        "user": {
            "user_id": new_user.user_id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "user_type": new_user.user_type
        }
    }), 201

@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validate input data
    if not all([email, password]):
        return jsonify({"msg": "Missing fields"}), 400

    # Check if the user exists
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Invalid email or password"}), 401

    # Create a JWT access token
    access_token = create_access_token(identity=user.user_id)

    # Return the user details and token
    return jsonify({
        "msg": "Login successful",
        "token": access_token,
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "full_name": user.full_name,
            "user_type": user.user_type
        }
    }), 200

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    # Get the current user ID from the JWT token
    user_id = get_jwt_identity()
    
    # Fetch the user from the database using the user ID
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Return the user profile details
    return jsonify({
        "user_id": user.user_id,
        "email": user.email,
        "full_name": user.full_name,
        "user_type": user.user_type,
        # You can add more fields as needed, such as relationships or additional details
    }), 200

@users_bp.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_user():

    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"msg": "User not found"}), 404
    admin = User.query.get(user_id) 
    data=request.get_json()
    user_email=data.get('email')
    
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    
    if admin.user_type != 'admin':
        return jsonify({"msg": "Unauthorized to delete user"}), 403
    try:

        db.session.delete(user)
    except Exception as e:
        return jsonify({"msg": "An error occurred while deleting the user"}), 500
    db.session.commit()
    return jsonify({"msg": "User deleted successfully"}), 200

@users_bp.route('/statistics', methods=['GET'])
@cross_origin()
@jwt_required()
def migrant_profile_stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    
    if user.user_type not in ['admin', 'provider', 'agent']:
        return jsonify({"msg": "User is not an admin"}), 403

    # Query the database for statistics
    total_profiles = db.session.query(func.count(MigrantProfile.profile_id)).scalar()
    avg_experience_years = db.session.query(func.avg(MigrantProfile.experience_years)).scalar()
    english_proficiency_counts = db.session.query(
        MigrantProfile.english_proficiency, func.count(MigrantProfile.english_proficiency)
    ).group_by(MigrantProfile.english_proficiency).all()
    location_preference_counts = db.session.query(
        MigrantProfile.location_preference, func.count(MigrantProfile.location_preference)
    ).group_by(MigrantProfile.location_preference).all()

    # Fetch all skills data
    all_skills = db.session.query(MigrantProfile.skills).all()

    # Split and count skills in Python
    skills_list = [skill for sublist in all_skills for skill in sublist[0].split(',')]
    skills_counts = Counter(skills_list)
    print(total_profiles, avg_experience_years, english_proficiency_counts, location_preference_counts, skills_counts)
    # Format the statistics into a dictionary

    if user.user_type == 'admin' or user.user_type=="agent":
        # Query the database for course statistics
        course_counts = db.session.query(
            Recommendation.course_id, func.count(Recommendation.course_id)
        ).group_by(Recommendation.course_id).all()

        # Fetch course names
        course_names = {course.course_id: course.course_name for course in Course.query.all()}
        avg_course_cost = db.session.query(func.avg(Course.course_cost)).join(Recommendation, Course.course_id == Recommendation.course_id).scalar()
        avg_course_cost = round(avg_course_cost, 2) if avg_course_cost is not None else None
        avg_experience_years = round(avg_experience_years, 2) if avg_experience_years is not None else None
        stats = {
            'total_profiles': total_profiles,
            'avg_experience_years': avg_experience_years,
            'english_proficiency_counts': {level: count for level, count in english_proficiency_counts},
            'location_preference_counts': {location: count for location, count in location_preference_counts},
            'skills_counts': dict(skills_counts),
            'course_counts': { course_names[course_id]: count for course_id, count in course_counts},
            'avg_course_cost': avg_course_cost
        }
    else:
        stats = {
            'total_profiles': total_profiles,
            'avg_experience_years': avg_experience_years,
            'english_proficiency_counts': {level: count for level, count in english_proficiency_counts},
            'location_preference_counts': {location: count for location, count in location_preference_counts},
            'skills_counts': dict(skills_counts),
        }



    return jsonify(stats), 200

@users_bp.route('/update/<int:id>', methods=['PUT'])
@cross_origin()
@jwt_required()
def update_user(id):
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
    if not admin:
        return jsonify({"msg": "User does not exist"}), 404
    user = User.query.get(id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    
    data = request.get_json()
    email = data.get('email')
    full_name = data.get('full_name')
    password = data.get('password')
    user_type = data.get('user_type')

    if email:
        user.email = email
    if full_name:
        user.full_name = full_name
    if password:
        user.password_hash = generate_password_hash(password)
    if admin.user_type != 'admin':
        return jsonify({"msg": "Unauthorized to update user"}), 403
    if user_type:
        user.user_type = data.get('user_type')

    try:
        db.session.commit()
    except Exception as e:
        return jsonify({"msg": "An error occurred while updating the user"}), 500

    return jsonify({"msg": "User updated successfully"}), 200