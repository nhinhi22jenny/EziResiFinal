from flask import Blueprint, jsonify, request
from app.models import  User,MigrantProfile,EducationProvider,Course
from app import db
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required
from werkzeug.security import generate_password_hash, check_password_hash

provider_bp = Blueprint('provider_bp', __name__,url_prefix='/provider')

@provider_bp.route('/questionnaire', methods=['POST'])
@jwt_required()
def questionnaire():
    data=request.get_json()
    institution_name=data.get('institution_name')
    institution_location=data.get('institution_location')
    user_id=get_jwt_identity()

    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'provider' :
        return jsonify({"msg": "User is not a provider"}),403

    # Validate input data
    if not all([institution_name, institution_location]):
        return jsonify({"msg": "Missing fields"}), 400

    if len(institution_name) > 255:
        return jsonify({"msg": "Institution name is too long"}), 400
    
    if len(institution_location) > 255:
        return jsonify({"msg": "Institution location is too long"}), 400

    # Check if the user already has a profile
    if EducationProvider.query.filter_by(user_id=user_id).first():
        return jsonify({"msg": "User already has a profile"}), 400

    # Create a new provider instance
    new_provider = EducationProvider(
        user_id=user_id,
        institution_name=institution_name,
        institution_location=institution_location
    )
    try:
        # Save the new provider to the database
        db.session.add(new_provider)
        db.session.commit()
    except Exception as e:
        return jsonify({"msg": "An error occurred while creating the profile"}), 500

    return jsonify({"msg": "Profile created successfully"}), 201

@provider_bp.route('/add-course', methods=['POST'])
@jwt_required()
def add_courses():
    data=request.get_json()
    course_name=data.get('course_name')
    course_duration=data.get('course_duration')
    course_fee=data.get('course_fee')
    user_id=get_jwt_identity()

    user=User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'provider' :
        return jsonify({"msg": "User is not a provider"}),403
    
    if not all([course_name, course_duration, course_fee]):
        return jsonify({"msg": "Missing fields"}), 400
    
    if len(course_name) > 255:
        return jsonify({"msg": "Course name is too long"}), 400
    
    if not isinstance(course_duration, (int, float)):
        return jsonify({"msg": "Course duration must be a number"}), 400
    
    if not isinstance(course_fee, (int, float)):
        return jsonify({"msg": "Course fee must be a number"}), 400
    
    provider=EducationProvider.query.filter_by(user_id=user_id).first()
    if not provider:
        return jsonify({"msg": "Provider does not exist"}), 404

    course=Course(
        provider_id=provider.provider_id,
        course_name=course_name,
        course_duration_years=course_duration,
        course_cost=course_fee
    )
    try:
        db.session.add(course)
        db.session.commit()
    except Exception as e:
        return jsonify({"msg": "An error occurred while adding the course"}), 500
    
    return jsonify({"msg": "Course added successfully"}), 201

@provider_bp.route('/courses', methods=['GET'])
@jwt_required()
def courses():
    user_id=get_jwt_identity()
    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'provider':
        return jsonify({"msg": "User is not a provider"}),403
    
    provider=EducationProvider.query.filter_by(user_id=user_id).first()
    if not provider:
        return jsonify({"msg": "Provider does not exist"}), 404

    courses=Course.query.filter_by(provider_id=provider.provider_id).all()
    courses_list=[]
    for course in courses:
        courses_list.append({
            "id": course.course_id,
            "name": course.course_name,
            "duration": course.course_duration_years,
            "amount": course.course_cost
        })
    
    return jsonify({"courses": courses_list}), 200

@provider_bp.route('/update-course/<int:course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
  data = request.get_json()
  course_name = data.get('course_name')
  course_duration = data.get('course_duration')
  course_fee = data.get('course_fee')
  user_id = get_jwt_identity()

  user = User.query.get(user_id)
  if not user:
    return jsonify({"msg": "User does not exist"}), 404
  if user.user_type != 'provider':
    return jsonify({"msg": "User is not a provider"}), 403

  if not any([course_name, course_duration, course_fee]):
    return jsonify({"msg": "No fields to update"}), 400

  if course_name and len(course_name) > 255:
    return jsonify({"msg": "Course name is too long"}), 400

  if course_duration and not isinstance(course_duration, (int, float)):
    return jsonify({"msg": "Course duration must be a number"}), 400

  if course_fee and not isinstance(course_fee, (int, float)):
    return jsonify({"msg": "Course fee must be a number"}), 400

  course = Course.query.get(course_id)
  if not course:
    return jsonify({"msg": "Course does not exist"}), 404

  provider = EducationProvider.query.filter_by(user_id=user_id).first()
  if not provider:
    return jsonify({"msg": "Provider does not exist"}), 404

  if course.provider_id != provider.provider_id:
    return jsonify({"msg": "Course does not belong to provider"}), 403

  if course_name:
    course.course_name = course_name
  if course_duration:
    course.course_duration_years = course_duration
  if course_fee:
    course.course_cost = course_fee

  db.session.commit()

  return jsonify({"msg": "Course updated successfully"}), 200

@provider_bp.route('/delete-course/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
  user_id = get_jwt_identity()
  user = User.query.get(user_id)
  if not user:
    return jsonify({"msg": "User does not exist"}), 404
  if user.user_type != 'provider':
    return jsonify({"msg": "User is not a provider"}), 403

  course = Course.query.get(course_id)
  if not course:
    return jsonify({"msg": "Course does not exist"}), 404

  provider = EducationProvider.query.filter_by(user_id=user_id).first()
  if not provider:
    return jsonify({"msg": "Provider does not exist"}), 404

  if course.provider_id != provider.provider_id:
    return jsonify({"msg": "Course does not belong to provider"}), 403

  try:
      db.session.delete(course)
  except Exception as e:
      return jsonify({"msg": "An error occurred while deleting the course"}), 500
  db.session.commit()

  return jsonify({"msg": "Course deleted successfully"}), 200

@provider_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id=get_jwt_identity()
    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'provider' or user.user_type != 'admin':
        return jsonify({"msg": "User is not a provider"}),403

    provider=EducationProvider.query.filter_by(user_id=user_id).first()
    if not provider:
        return jsonify({"msg": "Provider does not exist"}), 404

    return jsonify({
       "user_id": user.user_id,
        "email": user.email,
        "full_name": user.full_name,
        "user_type": user.user_type,
        "institution_name": provider.institution_name,
        "institution_location": provider.institution_location
    }), 200