from flask import Blueprint, jsonify, request
from app.models import  User,MigrantProfile,Course,SkilledOccupationList,Recommendation,EducationProvider
from app import db
from flask_jwt_extended import create_access_token,get_jwt_identity,jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import cross_origin
import pickle
import pandas as pd
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
import os
migrant_bp = Blueprint('migrant_bp', __name__,url_prefix='/migrant')


'''
TO DO:

Save Recommendations to the database
Unsave Recommendations from the database

'''
@migrant_bp.route('/questionnaire', methods=['POST'])
@cross_origin()
@jwt_required()
def questionnaire():
    data=request.get_json()
    skills=data.get('skills')
    experience_years=data.get('experience_years')
    english_proficiency=data.get('english_proficiency')
    location_preference=data.get('location_preference')

   
    user_id=get_jwt_identity()

    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'migrant':
        return jsonify({"msg": "User is not a migrant"}),403

    # Validate input data
    if not all([skills, experience_years, english_proficiency, location_preference]):
        return jsonify({"msg": "Missing fields"}), 400

    if english_proficiency not in ['Basic', 'Intermediate', 'Advanced', 'Fluent']:
        return jsonify({"msg": "Invalid English proficiency level"}), 400
    
    if not isinstance(experience_years, int):
        return jsonify({"msg": "Experience years must be an integer"}), 400
    
    if len(location_preference) > 255:
        return jsonify({"msg": "Location preference is too long"}), 400
    

    # Check if the user already has a profile
    if MigrantProfile.query.filter_by(user_id=user_id).first():
        return jsonify({"msg": "User already has a profile"}), 400

    # Create a new migrant profile instance
    new_profile = MigrantProfile(
        user_id=user_id,
        skills=skills,
        occupation=data.get('occupation'),  
        experience_years=experience_years,
        english_proficiency=english_proficiency,
        location_preference=location_preference
    )
    try:
        # Save the new profile to the database
        db.session.add(new_profile)
        db.session.commit()
    except Exception as e:
        return jsonify({"msg": "An error occurred while creating the profile"}), 500

    return jsonify({"msg": "Profile created successfully"}), 201


@migrant_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def recommendations():
    user_id=get_jwt_identity()
    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'migrant' and user.user_type != 'admin':
        return jsonify({"msg": "User is not a migrant"}),403
    
    course_id=10
    occupation_id=1
    migrant=MigrantProfile.query.filter_by(user_id=user_id).first()
    def RecommendedCourse(migrant):
        print(migrant.occupation, migrant.english_proficiency.capitalize(), migrant.location_preference, migrant.skills)
        # Access migrant attributes and implement recommendation logic
       
        # Implement recommendation logic here
        model_path = os.path.join(os.path.dirname(__file__), 'svm_model.pkl')

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"The model file {model_path} does not exist. Please ensure the file is in the correct location.")
        with open(model_path, 'rb') as file:
            loaded_svm_model = pickle.load(file)

            occupations = [
                "Software Engineer", "Civil Engineer", "Accountant", "Data Analyst", "Mechanical Engineer",
                "ICT Business Analyst", "Electrical Engineer", "Registered Nurse", "Early Childhood Teacher",
                "Architect", "Marketing Specialist", "Project Manager", "Teacher", "Graphic Designer",
                "Network Administrator"
            ]

            skills = ['Java', 'Python', 'Machine Learning', 'C++', 'AWS', 'Project Management', 'AutoCAD',
                      'Structural Analysis',
                      'Cost Estimation', 'Financial Reporting', 'Taxation', 'Auditing', 'Budgeting', 'Payroll', 'SQL',
                      'Data Visualization', 'Statistics', 'R', 'SolidWorks', 'Thermodynamics', 'Mechanical Design',
                      'Fluid Dynamics', 'Business Process Modeling', 'Systems Analysis', 'Agile Methodologies',
                      'Circuit Design',
                      'Power Systems', 'Embedded Systems', 'Matlab', 'Patient Care', 'Clinical Assessment',
                      'Medication Administration', 'Emergency Response', 'Childcare', 'Lesson Planning',
                      'Curriculum Development',
                      'Building Design', 'Construction Management', '3D Modeling', 'Digital Marketing', 'SEO',
                      'Content Creation',
                      'Market Research', 'Project Planning', 'Team Management', 'Risk Management', 'Scrum',
                      'Adobe Photoshop',
                      'Illustrator', 'InDesign', 'UI/UX Design', 'Network Security', 'Cisco Routers', 'Troubleshooting',
                      'Cloud Computing', 'Classroom Management']  # Add 'Classroom Management' to match training

            locations = ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia",
                         "Tasmania",
                         "ACT", "Northern Territory", "Regional Australia"]

            english_levels = ["Basic", "Intermediate", "Advanced", "Fluent"]

            le_occupation = LabelEncoder().fit(occupations)
            le_english_level = LabelEncoder().fit(english_levels)
            le_location = LabelEncoder().fit(locations)
            mlb_skills = MultiLabelBinarizer(classes=skills)
            mlb_skills.fit([skills])  # Fit the MultiLabelBinarizer with the complete skills list

            test_row = {
                'Occupation': migrant.occupation,
                'Skills': migrant.skills.split(","),
                'English Level': migrant.english_proficiency.capitalize(),
                'Location Preference': migrant.location_preference
            }

            test_row_transformed = pd.DataFrame([{
                'Occupation_Encoded': le_occupation.transform([test_row['Occupation']])[0],
                'English_Level_Encoded': le_english_level.transform([test_row['English Level']])[0],
                'Location_Preference_Encoded': le_location.transform([test_row['Location Preference']])[0]
            }])

            # Handle the multivalued 'Skills' field
            skills_transformed = pd.DataFrame(mlb_skills.transform([test_row['Skills']]), columns=mlb_skills.classes_)

            # Concatenate the transformed test row with the encoded skills
            test_row_final = pd.concat([test_row_transformed, skills_transformed], axis=1)

            # Ensure that the test data has the same columns as the training data
            # Add missing columns (features) with a default value of 0
            for col in loaded_svm_model.feature_names_in_:
                if col not in test_row_final.columns:
                    test_row_final[col] = 0

            # Reorder columns to match the order during training
            test_row_final = test_row_final[loaded_svm_model.feature_names_in_]

            # Predict the recommended course using the loaded SVM model
            predicted_course = loaded_svm_model.predict(test_row_final)

            # Output the result
            print(f"Recommended Course: {predicted_course[0]}")
            return predicted_course[0]



        # occupation=SkilledOccupationList.query.get(occupation_id)

    rcmndcrs= RecommendedCourse(migrant)
    course=Course.query.get(course_id)
    courses=Course.query.filter_by(course_name=rcmndcrs).all()
    print(courses)
    # occupation=SkilledOccupationList.query.get(occupation_id)
    recommendations_list = []
    for course in courses:
        provider = EducationProvider.query.get(course.provider_id)
        recommendations_list.append({
            "course": {
                "id": course.course_id,
                "name": course.course_name,
                "duration": course.course_duration_years,
                "fee": course.course_cost
            },
            "education_provider": {
                "id": provider.provider_id,
                "name": provider.institution_name,
                "location": provider.institution_location
            }
        })

    return jsonify(recommendations_list), 200

@migrant_bp.route('/save_recommendation', methods=['POST'])
@cross_origin()
@jwt_required()
def save_recommendation():
    data=request.get_json()
    course_id=data.get('course_id')
    # occupation_id=data.get('occupation_id')

    # pr_probability=data.get('pr_probability')
    # estimated_cost=data.get('estimated_cost')
    # estimated_duration_years=data.get('estimated_duration_years')
    # recommendation_rank=data.get('recommendation_rank')
    
    user_id=get_jwt_identity()

    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'migrant':
        return jsonify({"msg": "User is not a migrant"}),403

    course=Course.query.get(course_id)
    # occupation=SkilledOccupationList.query.get(occupation_id)
    migrant=MigrantProfile.query.filter_by(user_id=user_id).first()
    print(migrant,user_id)

    # if not course or not occupation:
    #     return jsonify({"msg": "Course or occupation does not exist"}), 404
    
    # recommendation=Recommendation(course_id=course_id,profile_id=migrant.profile_id,pr_probability=pr_probability,estimated_cost=estimated_cost,estimated_duration_years=estimated_duration_years,recommendation_rank=recommendation_rank)
    recommendation=Recommendation(course_id=course_id,profile_id=migrant.profile_id)

    try:
        db.session.add(recommendation)
        db.session.commit()
    except Exception as e:
        print(e)
        return jsonify({"msg": "An error occurred while saving the recommendation"}), 500

    # Save the recommendation to the database
    return jsonify({"msg": "Recommendation saved"}), 200

@migrant_bp.route('/unsave_recommendation/<int:recommend_id>', methods=['DELETE'])
@jwt_required()
def unsave_recommendation(recommend_id):
    user_id=get_jwt_identity()

    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'migrant':
        return jsonify({"msg": "User is not a migrant"}),403

    recommendation=Recommendation.query.get(recommend_id)
    if not recommendation:
        return jsonify({"msg": "Recommendation does not exist"}), 404

    db.session.delete(recommendation)
    db.session.commit()

    return jsonify({"msg": "Recommendation unsaved"}), 200

@migrant_bp.route('/recommendations/saved', methods=['GET'])
@jwt_required()
def saved_recommendations():
    user_id=get_jwt_identity()
    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'migrant':
        return jsonify({"msg": "User is not a migrant"}),403
    
    profile=MigrantProfile.query.filter_by(user_id=user_id).first()
    print(profile,user_id)

    recommendations=Recommendation.query.filter_by(profile_id=profile.profile_id).all()
    recommendations_list=[]
    for recommendation in recommendations:
        course=Course.query.get(recommendation.course_id)
        # occupation=SkilledOccupationList.query.get(recommendation.occupation_id)
        provider=EducationProvider.query.get(course.provider_id)
        recommendations_list.append({
            "id": recommendation.recommendation_id,
            "course": {
                "id": course.course_id,
                "name": course.course_name,
                "duration": course.course_duration_years,
                "fee": course.course_cost
            },
            # "occupation": {
            #     "id": occupation.occupation_id,
            #     "name": occupation.occupation_name,
            #     "code": occupation.occupation_code
            # },
            "education_provider": {
                "id": provider.provider_id,
                "name": provider.institution_name,
                "location": provider.institution_location
            },
            # "pr_probability": recommendation.pr_probability,
            # "estimated_cost": recommendation.estimated_cost,
            # "estimated_duration_years": recommendation.estimated_duration_years,
            # "recommendation_rank": recommendation.recommendation_rank
        })
    
    return jsonify({"recommendations": recommendations_list}), 200



@migrant_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id=get_jwt_identity()
    user=User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User does not exist"}), 404
    if user.user_type != 'migrant':
        return jsonify({"msg": "User is not a migrant"}),403

    profile=MigrantProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"msg": "User does not have a profile"}), 404

    return jsonify({
        "name": user.full_name,
        "email": user.email,
        "skills": profile.skills,
        "experience_years": profile.experience_years,
        "english_proficiency": profile.english_proficiency,
        "location_preference": profile.location_preference
    }), 200