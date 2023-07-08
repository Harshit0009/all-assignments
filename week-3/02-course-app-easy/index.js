const express = require('express');
const app = express();
const shortid = require("shortid");

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

//admin authentication
const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;

  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if(admin) {
    next();
  }else{
    res.status(403).json({ message: "Admin authentication failed" });
  }
}

const userAuthentication = (req, res, next) =>{
  const { username, password } = req.headers;
  const user = USERS.find(a => a.username === username && a.password ===  password);
  if(user) {
    req.user = user;
    next();
  }else{
    res.status(403).json({ message : "user authentication failed" });
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const existingAdmin = ADMINS.find(a => a.username === admin.username);
  if (existingAdmin) {
    res.status(403).json({ message: "Admin already exists" });
  }else{
    ADMINS.push(admin);
    res.json({ message: "Admin created successfully" });
  }
});

app.post('/admin/login', adminAuthentication, (req, res) => {
  // logic to log in admin
  res.json({ message: "Logged in successfully" });
});

app.post('/admin/courses', adminAuthentication, (req, res) => {
  // logic to create a course
  const course = req.body;
  course.id = shortid.generate();
  COURSES.push(course);
  res.json({ message: "Course generated successfully", courseId: course.id });
});

app.put('/admin/courses/:courseId', adminAuthentication, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    res.json({ message: "Course Updated Successfully",});
  }else{
    res.status(404).json({ message: "Course not found "});
  }
});

app.get('/admin/courses', adminAuthentication, (req, res) => {
  // logic to get all courses
  res.json({courses: COURSES });
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = { ...req.body, purchasedCourses: []};
  USERS.push(user);
  res.json({ message: "User created successfully",});
});

app.post('/users/login', userAuthentication, (req, res) => {
  // logic to log in user
  res.json({ message: "Logged in successfully "});
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
  const filteredCourses = COURSES.filter(c => c.published );
  res.json({ courses: filteredCourses });
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId && c.published);
  if(course){
    res.user.purchasedCourses.push(courseId);
    res.json({ message: "Course purchased successfully ", courseId: courseId });
  }else{
    res.status(404).json({ message: "Course not found or not available" });
  }
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
  const purchasedCourses = COURSES.filter(c => req.user.purchasedCourses.includes(c.id));
  res.json({ purchasedCourses: purchasedCourses });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
