import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import pickle

df = pd.read_csv('pr_occupation_dataset_large.csv')



print(f"Missing values:\n{df.isnull().sum()}")

df.fillna('', inplace=True)

mlb = MultiLabelBinarizer()
df['Skills'] = df['Skills'].apply(eval)
skills_encoded = pd.DataFrame(mlb.fit_transform(df['Skills']), columns=mlb.classes_, index=df.index)

label_encoder = LabelEncoder()
df['Occupation_Encoded'] = label_encoder.fit_transform(df['Occupation'])
df['English_Level_Encoded'] = label_encoder.fit_transform(df['English Level'])
df['Location_Preference_Encoded'] = label_encoder.fit_transform(df['Location Preference'])


df = pd.concat([df, skills_encoded], axis=1)


features = ['Occupation_Encoded', 'English_Level_Encoded', 'Location_Preference_Encoded'] + list(mlb.classes_)
X = df[features]
y = df['Course Chosen']



X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)



#Logistic Regression
logreg = LogisticRegression(max_iter=1000)
logreg.fit(X_train, y_train)
y_pred_logreg = logreg.predict(X_test)
logreg_accuracy = accuracy_score(y_test, y_pred_logreg)
print(f"Logistic Regression Accuracy: {logreg_accuracy:.4f}")
print(f"Classification Report for Logistic Regression:\n{classification_report(y_test, y_pred_logreg)}")

#Random Forest
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)
rf_accuracy = accuracy_score(y_test, y_pred_rf)
print(f"Random Forest Accuracy: {rf_accuracy:.4f}")
print(f"Classification Report for Random Forest:\n{classification_report(y_test, y_pred_rf)}")

#Support Vector Machine (SVM)
svm = SVC()
svm.fit(X_train, y_train)
y_pred_svm = svm.predict(X_test)
svm_accuracy = accuracy_score(y_test, y_pred_svm)
print(f"SVM Accuracy: {svm_accuracy:.4f}")
print(f"Classification Report for SVM:\n{classification_report(y_test, y_pred_svm)}")


with open('svm_model.pkl', 'wb') as file:
    pickle.dump(svm, file)


param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5]
}
grid_search_rf = GridSearchCV(RandomForestClassifier(random_state=42), param_grid, cv=5)
grid_search_rf.fit(X_train, y_train)

print(f"Best parameters for Random Forest: {grid_search_rf.best_params_}")
best_rf = grid_search_rf.best_estimator_
y_pred_best_rf = best_rf.predict(X_test)
best_rf_accuracy = accuracy_score(y_test, y_pred_best_rf)
print(f"Best Random Forest Accuracy after tuning: {best_rf_accuracy:.4f}")
