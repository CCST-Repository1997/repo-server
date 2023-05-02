const express = require('express');
const router = express.Router()

// progress Controller
const { getMyGroup, getProgress, createProgress, deleteProgress, updatePercent
} = require('../../Controller/Adviser/ProgressController')

// Adviser controller
const { archiveGroup, unarchiveGroup 
      } = require('../../Controller/Adviser/ArchiveGroupsController')

//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)


//GET all Percent
router.patch('/update-progress/:id', updatePercent)
router.get('/progress', getProgress)
router.post('/progress', createProgress)
router.delete('/progress/:id', deleteProgress)

// get the student group
router.get('/my-group', getMyGroup)

// ADVISER ROUTE - Archive a group and it's students
router.get('/archive/group')
router.post('/archive-group/:group_id', archiveGroup)
router.post('/unarchive-group/:group_id', unarchiveGroup)


module.exports = router;