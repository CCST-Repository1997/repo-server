const express = require('express');
const router = express.Router();

// Controller funtions
const { 
      // adviser
      signupAdmin, deleteReport,

      //dean
      getAllAdviser, getAllgroups, deleteSingleAdviser
      } = require('../../Controller/Roles/AdminController')



                  //ADVISER ROUTES
//SIGNUP ROUTE
router.post('/register', signupAdmin) //Add new user


//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)


//Repository Routes (Dean)
router.get('/advisers/manuscripts', getAllgroups) //Log in a user
router.get('/advisers', getAllAdviser) //Log in a user 

// Create Adviser Route (Dean)
router.delete('/delete-adviser/:adviser_id', deleteSingleAdviser)



// Group Report (Adviser)
router.delete('/delete-report', deleteReport)




module.exports = router;