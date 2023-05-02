const express = require('express');

const { getUserDashboard, getAdminDashboard, getSuperAdminDashboard
    } = require('../../Controller/Dashboard/DashboardController')
const router = express.Router()

//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)

//GET all groups
router.get('/adviser', getAdminDashboard)
router.get('/dean', getSuperAdminDashboard)
router.get('/student', getUserDashboard)


module.exports = router;