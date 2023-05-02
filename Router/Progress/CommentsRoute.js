const express = require('express');
const router = express.Router();

// imports
const {createComments, getComments, deleteComment} = require('../../Controller/Progress/CommentsController')

//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)

//POST a new group
router.post('/:id', createComments)

//GET all groups
router.get('/:id', getComments)

//DELETE a single group
router.delete('/:id', deleteComment)

module.exports = router;