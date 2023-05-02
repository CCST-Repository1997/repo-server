const express = require('express');

const { getAllStudents, deleteStudent, getAllGroups,
    getAllStudentsAdmin, getAllGroupsAdmin
    } = require('../../Controller/ManageUser/ManageUserController')
const router = express.Router()


//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)
    

//DEAN
    //POST a new group                      DONE
    router.get('/dean/groups/:id', getAllGroups)

    // get all the students of this adviser     
    router.get('/dean/students/:id', getAllStudents)
   
    //DELETE a single student               
    router.delete('/student/:id', deleteStudent)

    


//ADVISER 
    //GET all student                        
   router.get('/adviser/students', getAllStudentsAdmin)

    // get all the groups of this adviser       DONE
    router.get('/adviser/groups', getAllGroupsAdmin)


module.exports = router;