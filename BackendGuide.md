# Introduction #

The information in this page taken from this source.

http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/


# Import and Run Backend Project #

  1. Checkout the latest version of the source code from git repository.
  1. Open Intellij Idea and select Open from File menu.
  1. Select SocioActiveServer from your file system.
  1. Create a run configuration for "Spring boot application"
  1. Run the application and leave it running during development.
  1. The application needs to access the MongoDB. Make sure that you have followed the steps for Mongodb installation.

Backend application is designed as a Spring boot applicaiton, which enables REST api for database acccess.
Currently it is possible to POST user data to user item in db using:

http://localhost:8080/people

User item in the document store is composed of
- email
- userData

elements. email is the unique identifier, and userDAta is JSON object that holds all the information about the user.

It is possible to get all the user information by submitting a GET request to http://localhost:8080/people

It is possible to get userData for single user by submitting a GET
request to (for user with email field emredmrl@gmail.com)

http://localhost:8080/people/search/findByEmail?emredmrl@gmail.com

**A sample post request is placed to login.js and register.js, BUT it is commented out. Because it is not tested yet.**

To record an entry to the users document, currently we are using localStore.setItem notation. Instead of we can use angularjs $http.post and $http.get which I gave a brief example in these files.

To create other types similar to user, we just only create a User entity and UserRepository in backend project.


# MongoDB installation #

  1. Go to mongodb download page and download . https://www.mongodb.org/downloads
  1. Use default installation settings.
  1. After installation, open windows command prompt and go to c:\program files\mongodb\bin\ and run mongod.exe
  1. Do NOT close this command prompt as this is a daemon.
  1. Enjoy