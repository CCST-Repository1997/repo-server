const express = require('express');
// const {createWorkout, getWorkouts, getWorkout, deleteWorkout, updateWorkout} = require('../controllers/workoutController.js');

const { groupSelection, createGroup, renameGroups, getGroups, deleteGroup
} = require('../../Controller/Groups/GroupsController')

const router = express.Router()

//Signup all available groups
router.get('/groupselection', groupSelection)

//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)

//ADVISER ROUTE
//GET all groups
router.get('/', getGroups)

//POST a new group
router.post('/', createGroup)

//POST rename group
router.post('/rename', renameGroups)

//DELETE a single group
router.delete('/:id', deleteGroup)

//sub Routes Members
const { getmembers } = require('../../Controller/Groups/MembersController')
    

//ADVISER || STUDENT ROUTE: GET all groups members
router.get('/members/:id', getmembers)


module.exports = router;
