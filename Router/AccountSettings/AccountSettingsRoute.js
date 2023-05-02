const express = require('express');
const router = express.Router()

// Dean controller
const { getStudent, getAdviser, postYearAndSection, getYearAndSection, getDean
      } = require('../../Controller/AccountSettings/AccountSettingsController')

//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)

//STUDENT ROUTE
router.get('/student', getStudent)

//ADVISER ROUTE
router.get('/adviser', getAdviser)
router.get('/adviser/year-and-section', getYearAndSection)
router.post('/adviser/year-and-section/:id', postYearAndSection)


//DEAN ROUTE
router.get('/dean', getDean)

module.exports = router;