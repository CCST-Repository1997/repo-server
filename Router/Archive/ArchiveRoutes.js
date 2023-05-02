const express = require('express');
const router = express.Router()

// Dean controller
const { archiveAdviser, unarchiveAdviser, getArchiveAdvisers
      } = require('../../Controller/Dean/ArchiveController')

//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)

//DEAN ROUTE - GET all Archived Advisers
router.get('/archive', getArchiveAdvisers)
router.post('/archive/:adminId', archiveAdviser)
router.post('/unarchive/:adminId', unarchiveAdviser)




module.exports = router;