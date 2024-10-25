## Instruction on MacOS

### Run Backend
1. Change directory to Backend folder
2. Install dependencies from requirement.txt - your IDE should automatically suggest.
3. Change SQL URI in file 'config.py' by this format: 

mysql://username:password@localhost:3306/databasename

* Make sure you have mysql installed and have a local instance running *

4. run these commands in terminal

`flask db migrate`

`flask db upgrade`

5. run the 'run.py' file using this command:

`python3 run.py runserver`

or 

`py run.py runserver`

backend will start running. note the url. make sure it is the same url in frontent app.tsx file

### 2. Run Frontend
   2.1 Open a new terminal to run frontend simultaneously with Backend parts above
   2.2 Running these commands will start the frontend:

`npm install`

`npm run dev`

* Make sure you installed NodeJS in your computer before install npm * 

## Note:
For web admin, you need to edit directly in SQL
