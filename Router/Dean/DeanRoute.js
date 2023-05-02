const express = require('express');
const router = express.Router()


// SECTION Controller
const { createSection, getAllSections, deleteSection, 
} = require('../../Controller/Dean/SectionController')

// ARCHIVE Controller
const { archiveAdviser, unarchiveAdviser, getArchiveAdvisers
      } = require('../../Controller/Dean/ArchiveController')

// ACADEMIC YEAR Controller
const { createAcademicYear, getAllAcademicYears, deleteAcademicYear
      } = require('../../Controller/Dean/AcademicYearController')

// YEAR AND SECTION Controller
const { createAdvisersYearAndSection, getAdvisersYearAndSecrion, 
        deleteAdvisersYearAndSecrion, getAllYearAndSections
      } = require('../../Controller/Dean/YearAndSectionController')


//Students: Registration options 
router.get('/year-and-sections', getAllYearAndSections)
router.get('/academic-years', getAllAcademicYears)


//middleware Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)


//Dean: add section for the registration form
router.get('/sections', getAllSections)
router.post('/section', createSection)
router.delete('/section/:id', deleteSection)

//Dean: GET all Archived Advisers
router.get('/archive', getArchiveAdvisers)
router.post('/archive/:adminId', archiveAdviser)
router.post('/unarchive/:adminId', unarchiveAdviser)

//Dean: Year and Section
router.post('/advisers-year-and-section', createAdvisersYearAndSection)
router.get('/advisers-year-and-section', getAdvisersYearAndSecrion)
router.delete('/advisers-year-and-section/:id', deleteAdvisersYearAndSecrion)

//Dean: add AcademicYear for the registration form
router.post('/academic-year', createAcademicYear)
router.delete('/academic-year/:id', deleteAcademicYear)


module.exports = router;