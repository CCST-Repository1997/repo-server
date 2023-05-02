const express = require('express');

// CONTROLLER ROUTES
// TASK FILES FOR ADVISER
const { createFile, getFiles, getFile, deleteFile,     
    } = require('../../Controller/FileUpload/FileUploadController')

// MANUSCRIPT FILES
const { createManuscript, getAllManuscripts, deleteManuscript, getSingleManuscript 
} = require('../../Controller/FileUpload/ManuscriptFilesController') 

// ABSTRACT FILES
const { deleteAbstract, getSingleAbstract 
        } = require('../../Controller/FileUpload/AbtractFilesController')

// TASK FILES FOR STUDENT
const { createStudentTask, getStudentTasks, getStudentTask, deleteStudentTask 
} = require('../../Controller/FileUpload/StudentTaskController')



const router = express.Router()


//Middlewares   
    //Multer
const { upload } = require('../../Middleware/FileUploadMiddleware')

    //Authorization
const requireAuth = require('../../Middleware/requireAuth')
router.use(requireAuth)

//REPOSITORY MANUSCRIPT - For adviser || dean
    //GET all Manuscript
    router.get('/manuscript', getAllManuscripts)
    
    //POST a Manuscript 
    router.post('/manuscript', upload.array('manuscriptFile', 2), createManuscript)

    // Download a single group
    router.get('/manuscript/:id', getSingleManuscript)

    // DELETE a single group
    router.delete('/manuscript/:id', deleteManuscript)

//REPOSITORY ABSTRACT - For adviser || dean
    // Download a single group
    router.get('/abstract/:id', getSingleAbstract)

    // DELETE a single group
    router.delete('/abstract/:id', deleteAbstract)


//TASK PAGE - For adviser 
    // POST a new task file (TASK)
    router.post('/', upload.single('adviserTask'), createFile)

    // GET all groups
    router.get('/:id', getFiles)

    // GET a single groups
    router.get('/single/:id', getFile)

    // DELETE a single group
    router.delete('/download/:id', deleteFile)


//TASK PAGE - For Student
    // POST a new task file 
    router.post('/student', upload.single('studentTask'), createStudentTask)

    // GET all Student Files
    router.get('/student/:id', getStudentTasks)

    // GET a single Student Files (download link)
    router.get('/student/download/:id', getStudentTask)

    // DELETE a single Student Files
    router.delete('/student/:id', deleteStudentTask)


module.exports = router;