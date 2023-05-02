const express = require('express');
const router = express.Router();

// imports
const { createReport,
        getReports, 
        deleteReport
      } = require('../../Controller/Reports/ReportsController')

//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)

// STUDENT
  //POST a new report
router.post('/', createReport)


// ADVISER
  //GET all report
router.get('/:id', getReports)

  //DELETE a single report
router.delete('/:id', deleteReport)




module.exports = router;