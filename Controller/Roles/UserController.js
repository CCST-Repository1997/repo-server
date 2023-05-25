const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail')

// Models
const UserModel = require('../../Model/Roles/UserModel')
const AdminModel = require('../../Model/Roles/AdminModel')
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')

const YearAndSectionModel = require('../../Model/Dean/YearAndSectionModel')
const GroupModel = require('../../Model/Groups/GroupsModel')

//jsonwebtoken
const jwt = require('jsonwebtoken');
const GroupsModel = require('../../Model/Groups/GroupsModel');

//funtion to create a token
const createToken = (_id) => {
                    //user _id     //env. variable     //token expiry date
    return jwt.sign( {_id: _id }, process.env.SECRET, { expiresIn: '5h' }) 
}

// LOGIN CONTROLLER
const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        // calls a static method inside UserModel
        const User = await UserModel.login( email,  password )

        //create a token
        const token = createToken(User._id)
        const name = User.name

        // check if the logged in user is student
        if(User.authorization === 'student'){
            return res.status(200).json({ name, token, authorization: User.authorization, group_id: User.group_id});
        }

        // check if the logged in user is adviser
        if(User.authorization === 'admin'){
            return res.status(200).json({ name, token, admin_id: User._id ,authorization: User.authorization});
        }

        // check if the logged in user is dean
        if(User.authorization === 'superadmin'){
            return res.status(200).json({ name, token, authorization: User.authorization });
        }
       

    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}

// SIGNUP CONTROLLER
const signupUser = async (req, res) => {
    const { name, password, studentID, email, position, yearAndSection_id, group_id} = req.body; 

    try {
        // finds the group name of that group_id
        const groupName = await GroupsModel.findById( group_id ).select('groups')
        if(!groupName){
           return res.status(400).json({ error: "No group name found!"});
        }

        // calls a static method inside UserRegistrationModel
        const User = await UserModel.signup( name, email, studentID, 
            groupName.groups, password,  position, yearAndSection_id, group_id)

        //create a token
        const token = createToken(User._id)

        res.status(200).json({ name, token, authorization: User.authorization});

    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}



// FORGOT PASSWORD CONTROLLER
// ALL USER ROUTE: STUDENT || ADVISER || DEAN
const createForgotPassword = async (req, res) => {
    const { email } = req.body

    try {
        // function that handle the sending of email
        const handleForgotPassword = (email, _id) => {
            //create a token
            const token = jwt.sign( {  email: email, id: _id }, process.env.SECRET, { expiresIn: '5m' }) 
            const link = `https://ccst-repo-app-api.onrender.com/user/forgot-password/${_id}/${token}`

            //nodemailer
            // console.log(link);
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: `${process.env.SENDGRID_USER}`,
                pass: `${process.env.SENDGRID_PASS}`
                }
            });
            
            var mailOptions = {
                from: 'youremail@gmail.com',
                to: email,
                subject: 'CCST Repository System - Password Reset',
                text: link
            };
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    // console.log(error);
                    return res.status(400).json({error: "The mail notification failed to send on your gmail account. Please try again"})
                } else {
                    // console.log('Email sent: ' + info.response);
                    return res.status(200).json({ 
                        message: 'Password reset link sent to email and will only be valid for 5 minutes!' 
                    })
                }
            });
        }

        // Find if its a STUDENT EMAIL
        const User = await UserModel.findOne({ email })
        if(User) {
            return handleForgotPassword(User.email, User._id)
        }

        // Find if its an ADVISER EMAIL
        const Adviser = await AdminModel.findOne({ email })
        if(Adviser) {
            return handleForgotPassword(Adviser.email, Adviser._id)
        }

        // Find if its an ADVISER EMAIL
        const Dean = await SuperAdminModel.findOne({ email })
        if(Dean) {
            return handleForgotPassword(Dean.email, Dean._id)
        }

        // Catch error
        else {
            return res.status(400).json({error: "No Account with this email found. Please try again"})
        }

    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}

// find the user account account using email
const getForgotPassword = async (req, res) => {
    const { id, token } = req.params;
  
    try {
      // Check if the user is a Student
      const user = await UserModel.findOne({ _id: id });
      if (user) {
        const verify = jwt.verify(token, process.env.SECRET);
        return res.render('index.ejs', { email: verify.email, status: 'Your account is Verified' });
      }
  
      // Check if the user is an Adviser
      const adviser = await AdminModel.findOne({ _id: id });
      if (adviser) {
        const verify = jwt.verify(token, process.env.SECRET);
        return res.render('index.ejs', { email: verify.email, status: 'Your account is Verified' });
      }
  
      // Check if the user is a Dean
      const dean = await SuperAdminModel.findOne({ _id: id });
      if (dean) {
        const verify = jwt.verify(token, process.env.SECRET);
        return res.render('index.ejs', { email: verify.email, status: 'Your account is Verified' });
      }
  
      // No user found
      return res.status(400).json({ error: 'No User Found. Your account is Not Verified' });

    } catch (error) {
      // Handle token verification error
      console.error(error);
      res.status(400).json({ error: 'Invalid Token!' });
    }
  };

// save the new password of the user
const newForgotPassword  = async (req, res) => {
    const { id, token } = req.params
    const { password } = req.body


    try {
        // Check the student
        const User = await UserModel.findOne({ _id: id })
        if(User){
            const verify = jwt.verify( token, process.env.SECRET )
            // res.status(200).json('Verified');
            
            // hashing and salting password
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(password, salt)

            
            await UserModel.updateOne({ _id: id }, 
                { $set:{ password: hash}})

            return res.render('index.ejs', { email: verify.email, status: "Your password is successfuly changed." })
        }

        // Check the Adviser
        const Adviser = await AdminModel.findOne({ _id: id })
        if(Adviser){
            const verify = jwt.verify( token, process.env.SECRET )
            // res.status(200).json('Verified');
            
            // hashing and salting password
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(password, salt)

            
            await AdminModel.updateOne({ _id: id }, 
                { $set:{ password: hash}})

            return res.render('index.ejs', { email: verify.email, status: "Your password is successfuly changed." })
        }

        // Check the Adviser
        const Dean = await SuperAdminModel.findOne({ _id: id })
        if(Dean){
            const verify = jwt.verify( token, process.env.SECRET )
            // res.status(200).json('Verified');
            
            // hashing and salting password
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(password, salt)

            
            await SuperAdminModel.updateOne({ _id: id }, 
                { $set:{ password: hash}})

            return res.render('index.ejs', { email: verify.email, status: "Your password is successfuly changed." })
        }

        // catch Error
        if(!User || !Adviser || !Dean){
            return res.status(400).json({error: "No User Found!"})
        }

        
    } catch (error) {
        res.status(200).json({ status: "Something went wrong" });
    }
}



//ADVISER: Officially register the pending student
const updatePendingUser = async (req, res)  => {
    // Adviser id taken
    const admin_id = req.user._id

    // Student id taken
    const { id } = req.params;

    // Auth
    const { authorization } = req.body;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( admin_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking: find the adviser
        const adviser = await AdminModel.findById({ _id: admin_id })
        if(!adviser){
            return res.status(400).json({error: "Error! Access Unauthorized. No user found!"})
        }

        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( id )) {
            return res.status(400).json({error: "No User Found!"})
        }

        // check if the adviser if the student he/she accept belongs to his created group
        const checkGroup = await GroupModel.find({ admin_id: adviser._id })
        if(checkGroup.length === 0){
            return res.status(400).json({error: "You dont have a group. Please create a group first!"})
        }

        // Find the student
        const findStudent = await UserModel.findOne({_id: id});
        if(!findStudent){
            return res.status(400).json({error: "This student group doesn't belong to your section. Please select a different student"})
        }

        // Check if the student belongs to the adviser's group
        //  if(!checkGroup.includes(findStudent.group_id)){
        //     return res.status(400).json({error: "The student does not belong to your group!"})
        // }

        // Find the section
        const section = await YearAndSectionModel.findById(findStudent.yearAndSection_id)
        if(!section){
            return res.status(400).json({error: "The student doesn't have a section yet!"})
        }

        // Find "id" if there is the same "ObjectId" in Database and Delete the data
        const user = await UserModel.updateOne(
            // the student id
            { _id: id }, 

            //data to update
            { $set: 
                {   authorization: authorization, 
                    admin_id, 
                    section: section.section
                }}
        );

        if(!user) {
            return res.status(400).json({error: "No User Found!"})
        }

        // logs the Id found on the server!
        res.status(200).json(user);
        
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}

//ADVISER: GET ALL PENDING USERS
const getAllPendingUser = async (req, res)  => {

    //adviser id taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking: find the adviser
        const adviser = await AdminModel.findById( user_id )
        if(!adviser){
            return res.status(400).json({error: "Error! Access Unauthorized. No user found!"})
        }
        
        // find all his pending student using the admin_id and authorization
        const pending = await UserModel.find({ authorization: 'pending' });
        if(!pending.length === 0){
            return res.status(400).json({error: "No student under your section found!"})
        }

        // send all the pending student accounts
        res.status(200).json(pending);

    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}

//ADVISER: DELETE a single pending account
const deletePendingUser = async (req, res) => {
    const {id} = req.params;

    //adviser id taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking: find the adviser
        const adviser = await AdminModel.findById({ _id: user_id })
        if(!adviser){
            return res.status(400).json({error: "Error! Access Unauthorized. No user found!"})
        }

        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({error: "Pending account deletion failed. No User Found!"})
        }

        // Find "id" the pending user and delete account
        const pending = await UserModel.findOneAndDelete({_id: id});
        if(!pending) {
            return res.status(400).json({error: "No User Found!"})
        }

        // logs the Id found on the server!
        res.status(200).json(pending);
        
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
 
     
 }

//ADVISER: Get all his/her Students
const getAllStudents = async (req, res)  => {

    //Adviser id taken
    const user_id = req.user._id

    try {

        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking: find the adviser
        const adviser = await AdminModel.findById({ _id: user_id })
        if(!adviser){
            return res.status(400).json({error: "Error! Access Unauthorized. No user found!"})
        }

        // logs all the  inside workoutModel
        const student = await UserModel.find({ admin_id: user_id, authorization: 'student'});

        if(!student){
            return res.status(400).json({error: "No User Found!"})
        }

        // send all the student of that adviser
        res.status(200).json(student);
        
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }

}

//ADVISER: Delete one of the students registered
const deleteStudent = async (req, res)  => {
    const { id } = req.params;
 
    //adviser id taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking: find the adviser
        const adviser = await AdminModel.findById({ _id: user_id })
        if(!adviser){
            return res.status(400).json({error: "Error! Access Unauthorized. No user found!"})
        }

        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({error: "_id Error: No User Found!"})
        }

        // Find "id" if there is the same "ObjectId" in Database and Delete the data
        const student = await UserModel.findOneAndDelete({ _id: id });

        if(!student) {
            return res.status(400).json({error: "No User Found!"})
        }

        // logs the Id found on the server!
        res.status(200).json(student);

        
    // catch error
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }    
}


module.exports = { signupUser, loginUser, 
                    createForgotPassword, getForgotPassword, newForgotPassword,
                    updatePendingUser, 
                    getAllPendingUser, getAllStudents,
                    deletePendingUser, deleteStudent
                };
