from flask import Blueprint, jsonify, request
from app.models import  User,MigrantProfile,EducationProvider,Course,SkilledOccupationList,MigrationAgent
from app import db
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
admin_bp = Blueprint('admin_bp', __name__,url_prefix='/admin')

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    user_id=get_jwt_identity()
    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'admin':
        return jsonify({"msg": "User is not an admin"}),403

    users=User.query.all()
    users_list=[]
    for user in users:
        users_list.append({
            "user_id": user.user_id,
            "email": user.email,
            "full_name": user.full_name,
            "user_type": user.user_type
        })
    return jsonify(users_list), 200

@admin_bp.route('/agents', methods=['GET'])
@jwt_required()
def get_agents():
    user_id=get_jwt_identity()
    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'admin':
        return jsonify({"msg": "User is not an admin"}),403

    agents=MigrationAgent.query.all()
    agents_list=[]
    for agent in agents:
        agents_list.append({
            "name": user.full_name,
            "email":user.email,
            "user_id": agent.user_id,
            "agency_name": agent.agency_name
        })
    return jsonify(agents_list), 200

@admin_bp.route('/providers', methods=['GET'])
@jwt_required()
def get_providers():
    user_id=get_jwt_identity()
    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'admin':
        return jsonify({"msg": "User is not an admin"}),403

    providers=EducationProvider.query.all()
    providers_list=[]
    for provider in providers:
        providers_list.append({
           "user_id": provider.user_id,
           "name": user.full_name,
            "email":user.email,
            "user_id": provider.user_id,
            "institution_name": provider.institution_name,
            "institution_location": provider.institution_location
        })
    return jsonify(providers_list), 200

@admin_bp.route('/skilled_occupations', methods=['GET'])
@jwt_required()
def get_skilled_occupations():
  user_id = get_jwt_identity()
  user = User.query.get(user_id)
  if not user:
    return jsonify({"msg": "User does not exist"}), 404
  if user.user_type != 'admin':
    return jsonify({"msg": "User is not an admin"}), 403
  skilled_occupations = SkilledOccupationList.query.all()
  skilled_occupations_list = []
  for occupation in skilled_occupations:
    skilled_occupations_list.append({
      "id": occupation.occupation_id,
      "name": occupation.occupation_name,
      "code": occupation.occupation_code
    })
  return jsonify(skilled_occupations_list), 200

@admin_bp.route('/add_skilled_occupation', methods=['POST'])
@jwt_required()
def create_skilled_occupation():
  user_id = get_jwt_identity()
  user = User.query.get(user_id)
  if not user:
    return jsonify({"msg": "User does not exist"}), 404
  if user.user_type != 'admin':
    return jsonify({"msg": "User is not an admin"}), 403
  
  data = request.get_json()
  name=data.get('name')
  code=data.get('code')

  if not all([name, code]):
    return jsonify({"msg": "Missing fields"}), 400
  
  if len(name) > 255:
    return jsonify({"msg": "Occupation name is too long"}), 400
  
  if len(code) > 50:
    return jsonify({"msg": "Occupation code is too long"}), 400

  new_occupation = SkilledOccupationList(
    occupation_name=name,
    occupation_code=code
  )

  try:
    db.session.add(new_occupation)
    db.session.commit()
  except Exception as e:
    return jsonify({"msg": "An error occurred while creating the skilled occupation"}), 500

  return jsonify({"msg": "Skilled occupation created successfully"}), 201

@admin_bp.route('/skilled_occupations/<int:id>', methods=['PUT'])
@jwt_required()
def update_skilled_occupation(id):
  user_id = get_jwt_identity()
  user = User.query.get(user_id)
  if not user:
    return jsonify({"msg": "User does not exist"}), 404
  if user.user_type != 'admin':
    return jsonify({"msg": "User is not an admin"}), 403
  data = request.get_json()
  occupation = SkilledOccupationList.query.get(id)
  if not occupation:
    return jsonify({"msg": "Skilled occupation not found"}), 404
  
  if 'name' in data:
    occupation.occupation_name = data['name']
  if 'code' in data:
    occupation.occupation_code = data['code']
  
  db.session.commit()
  return jsonify({"msg": "Skilled occupation updated successfully"}), 200

@admin_bp.route('/clear_all', methods=['DELETE'])
@jwt_required()
def clear_all_tables():
    # Disable foreign key checks
    db.session.execute(text('SET FOREIGN_KEY_CHECKS = 0;'))
    
    # List of all tables to be cleared
    tables = [
        'migrant_profiles',
        'recommendations',
        'users',
        'education_providers',
        # Add other tables as necessary
    ]
    
    # Truncate each table
    for table in tables:
        db.session.execute(text(f'TRUNCATE TABLE {table};'))
    
    # Re-enable foreign key checks
    db.session.execute(text('SET FOREIGN_KEY_CHECKS = 1;'))
    
    db.session.commit()
    
    return jsonify({"msg": "All tables cleared successfully"}), 200


@admin_bp.route('/skilled_occupations/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_skilled_occupation(id):
  user_id = get_jwt_identity()
  user = User.query.get(user_id)
  if not user:
    return jsonify({"msg": "User does not exist"}), 404
  if user.user_type != 'admin':
    return jsonify({"msg": "User is not an admin"}), 403
  occupation = SkilledOccupationList.query.get(id)
  if not occupation:
    return jsonify({"msg": "Skilled occupation not found"}), 404
  
  try:
    db.session.delete(occupation)
    db.session.commit()
  except Exception as e:
    return jsonify({"msg": "An error occurred while deleting the skilled occupation"}), 500
  
  return jsonify({"msg": "Skilled occupation deleted successfully"}), 200