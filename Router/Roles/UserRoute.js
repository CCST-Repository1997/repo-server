const express = require('express');
const router = express.Router();


// Controller funtions
const { signupUser, loginUser,
        createForgotPassword, getForgotPassword, newForgotPassword,    
        updatePendingUser,               
        getAllPendingUser, getAllStudents,   
        deletePendingUser, deleteStudent
    } = require('../../Controller/Roles/UserController')

// AUTHENTICATION ROUTES
//LOGIN ROUTE
    router.post('/login', loginUser) //Log in a user

//SIGNUP ROUTE
    router.post('/signup', signupUser) //Add new user

// FORGOT PASSWORD ROUTE
    router.post('/forgot-password', createForgotPassword) //forgotPassword
    router.get('/forgot-password/:id/:token', getForgotPassword) //forgotPassword
    router.post('/forgot-password/:id/:token', newForgotPassword) //forgotPassword


//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
    router.use(requireAuth)

// USER || STUDENT
//PENDING ROUTE
    router.get('/pending', getAllPendingUser)  
    router.patch('/pending/:id', updatePendingUser)     
    router.delete('/pending/:id', deletePendingUser)  

//GET ALL PENDING USERS
    // user 
    router.get('/students', getAllStudents)
    router.delete('/students/:id', deleteStudent)



module.exports = router;