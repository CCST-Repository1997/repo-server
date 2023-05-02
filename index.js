const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const path = require('path')

//ENVIRONMENT VARIABLE
require('dotenv').config()

const app = express();

// middle ware

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname , 'public')));
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});


// Connect to DB
// mongoose.connect("mongodb://127.0.0.1:27017/SystemDB", {useNewUrlParser: true})
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // only listen to request if the database is working
    app.listen(process.env.PORT, () => {
      console.log("Server is listening in port 3001");
    })
  })
  .catch((error) => {
    console.log(error)
  })

//Import Routes
  // Groups Router
  const GroupsRoute = require('./Router/Groups/GroupsRoute');
  app.use('/group', GroupsRoute);
  
  // Progress Routers
    // task
    const CreateTaskRoute = require('./Router/Progress/CreateTaskRoute')
    app.use('/progress/createtask', CreateTaskRoute);
    // comment
    const CommentsRoute = require('./Router/Progress/CommentsRoute')
    app.use('/progress/comments', CommentsRoute);

  // Report Router
  const ReportRoute = require('./Router/Reports/ReportsRoute')
  app.use('/report', ReportRoute);
  
  // File upload Router
  const FileUploadRoute = require('./Router/FileUpload/FileUploadRouter')
  app.use('/upload', FileUploadRoute)

  //Register USER || STUDENT
  const UserRoute = require('./Router/Roles/UserRoute')
  app.use('/user',  UserRoute)

  //Register ADMIN || ADVISER
  const AdminRoute = require('./Router/Roles/AdminRoute')
  app.use('/admin',  AdminRoute)

  //Manage User (Admin)
  const ManageUserRoute = require('./Router/ManageUser/ManageUserRoute') 
  app.use('/manageuser',  ManageUserRoute)

  //Dashboard All POV
  const DashboardRoute = require('./Router/Dashboard/DashboardRouter')
  app.use('/dashboard',  DashboardRoute)

  // Dean Routes: Archived || Academic Year || Section
  const DeanRoute = require('./Router/Dean/DeanRoute')
  app.use('/dean', DeanRoute)

  // Adviser Routes: 
  const AdviserRoute = require('./Router/Adviser/AdviserRoutes')
  app.use('/adviser', AdviserRoute)

  // Account Settings Router
  const AccountSettingsRoute = require('./Router/AccountSettings/AccountSettingsRoute')
  app.use('/account-settings', AccountSettingsRoute);

