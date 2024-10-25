## Instruction on MacOS

##1. Run Backend
1.0 change directory to Backend folder
1.1 Install dependencies from requirement.txt - your IDE should automatically suggest.

1.2. change sql URI in file 'config.py' by this format: 

mysql://username:password@localhost:3306/databasename

**Make sure you have mysql installed and have a local instance running**

1.3 run these commands in terminal

`flask db migrate`

`flask db upgrade`

1.4. run the 'run.py' file using this command:

python3 run.py runserver

or 

py run.py runserver

1.3. Initialize and set up the schema of the db
`flask db init`

1.4. Finally run the server
`flask run`

backend will start running. note the url. make sure it is the same url in frontent app.tsx file

## 2. Run Frontend
   2.1 Open a new terminal to run frontend simultaneously with Backend parts above
   2.2 Running these commands will start the frontend:

`npm install`

`npm run dev`

## Note:
For web admin, you need to edit directly in SQL
