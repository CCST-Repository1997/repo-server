const mongoose = require('mongoose');
const path = require("path")
const fs = require('fs');

//  User MODELS
const AdminModel = require('../../Model/Roles/AdminModel')

// Model
const StudentTaskModel = require('../../Model/FileUpload/StudentTaskModel')



//CONTROLLER FUNCTIONS
//POST a new File
const createStudentTask = async (req, res) => {
    // const { title, description } = req.body;
    const { mimetype } = req.file;
    const paths = req.file.path;
    const studentTask = req.file.originalname;

    // task id and group id taken
    const { task_id, group_id, progress_id } = req.body

    //student id taken
    const user_id = req.user._id;

    if(req.file){
        try {
            // validate if its an ObjectId
            if(!mongoose.Types.ObjectId.isValid( user_id )) {
                return res.status(400).json({error: "Access Denied. Please try to login again!"})
            }

            // create the data send to the database
            const files = await StudentTaskModel.create({ 
                fileName: studentTask, 
                path: paths, 
                mimetype: mimetype,
                uploader_id: user_id,
                task_id,
                progress_id,
                group_id,
                deleted: false
            });

            // error
            if(!files){
                return res.status(400).json('Failed to upload your task. Please try again');
            }

            res.status(200).json({ msg: 'Uploaded in StudentTaskModel: ', files });

        } catch (error) {
            //log if there is any error
            res.status(400).json({ error: error.message});
        } 
    }
}

//GET all Files
const getStudentTasks = async (req, res) => {
    const { id } = req.params

    // user id
    const user_id = req.user._id;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Access Denied. Please try to login again!"})
        }

        // logs all the Data inside StudentTaskModel
        const files = await StudentTaskModel.find({ task_id: id });

        // error
        if(!files){
            return res.status(400).json('No file found.');
        }

        // sort by date
        const sortedByCreationDate = files.sort(
            (a, b) => b.createdAt - a.createdAt
        );

        res.status(200).json({msg: "Student Task data: ", files});

    // catch error
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}

const getStudentTask = async (req, res) => {
    // get the id from the request parameters
    const { id } = req.params;

    // user id
    const user_id = req.user._id;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Access Denied. Please try to login again!"})
        }

        // Find the file document by id in the database
        const files = await StudentTaskModel.findById({ _id: id });

        // Get the path location
       const paths = __dirname;

        // Join the paths variable with the file's path
        const downloadPath = path.join(paths,'\\', files.path).replace('Controller/FileUpload/\\', '');

        // set the content-type header
        res.set({
            'Content-Type': files.mimetype
        });

        // send the file to the client
        res.download(downloadPath, (err) => {
            if (err) {
                return console.log({ error: "Error while downloading file", message: err.message });
            } else {
              //delete the file first 
              fs.unlink(downloadPath, async (err) => {
                if (err) {
                    return console.log({error: "Failed to delete the file as you download. Please try again"});
                } else{
                    // update the deleted field to true
                    const updateFile = await StudentTaskModel.updateOne({ _id: id }, { $set: { deleted: true } })
                    if(!updateFile){
                        return console.log({error: 'Error please try again'});
                    }
                    return console.log("Deleted File successfully.");
                }
                
              });
            }
        });

    } catch (error) {
        // catch any errors and send a response with a 400 status code and an error message
        res.status(400).send({ error: error.message });
    }
}

// DELETE a single File
const deleteStudentTask = async (req, res) => {
    const { id } = req.params;

    // adviser id taken
    const user_id = req.user._id;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Access Denied. Please try to login again!"})
        }

        // Check if the user is a adviser
        const adviser = await AdminModel.findOne({ _id: user_id }); 
        if(!adviser || !adviser.authorization === 'admin'){
            return res.status(400).json({ error: "Unauthorized Access!"});
        }
        
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( id )) {
            return res.status(400).json({error: "No file Found!"})
        }

        // // Find "id" if there is the same "ObjectId" in Database and Delete the data
        const file = await StudentTaskModel.findOneAndDelete({ _id: id });

        // error
        if(!file) {
            return res.status(400).json({error: "No file Found!"})
        }

        //delete the file
            //path
            const paths = __dirname;
            const downloadPath = path.join(paths,'ManuscriptFiles/').replace('Controller/FileUpload/', '');
        
            //filename
            const split = file.path.split('/');
            const filename = split[split.length - 1];
    
            // pass to font end
            fs.unlink(downloadPath + filename, (err) => {
                // error
                if (err) {
                    return console.log("File deletion failed!", err)
                }
                // success
                return console.log("Delete File successfully.");
            });

        // return success message
        return res.status(200).json({ message: "File deleted successfully"});

    } catch (error) {
        res.status(400).send({error: error.message});
    }
   
}


 module.exports = { createStudentTask, getStudentTasks, getStudentTask, deleteStudentTask };
