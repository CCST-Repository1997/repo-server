const express = require('express');
const router = express.Router();

// imports
const { createTask, getTask, deleteTask, updateTask } = require('../../Controller/Progress/CreateTaskController')

//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)

//POST a new group
router.post('/', createTask)

//GET all groups
router.get('/:id', getTask)

//DELETE a single group
router.delete('/:id', deleteTask)

//POST a new group
router.patch('/:id', updateTask)


module.exports = router;