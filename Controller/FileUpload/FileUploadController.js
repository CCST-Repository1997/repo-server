const mongoose = require('mongoose');
const path = require("path")
const fs = require('fs');

//IMPORT MODEL
const AdminModel = require('../../Model/Roles/AdminModel')
const FileUploadModel = require('../../Model/FileUpload/FileUploadModel');


//CONTROLLER FUNCTIONS
//POST a new File
const createFile = async (req, res) => {
    // const { title, description } = req.body;
    const { mimetype } = req.file;
    const paths = req.file.path;
    const fileUpload = req.file.originalname;

    // task id and group id taken
    const { task_id, group_id, progress_id } = req.body

    // admin id taken
    const user_id = req.user._id;

    if(req.file){
        try {
            // validate if its an ObjectId
            if(!mongoose.Types.ObjectId.isValid( user_id )) {
                return res.status(400).json({error: "Access Denied. Please try to login again!"})
            }

            // create the data send to the database
            const files = await FileUploadModel.create({ 
                fileName: fileUpload, 
                path: paths, 
                mimetype: mimetype,
                uploader_id: user_id,
                task_id,
                progress_id,
                group_id,
                deleted: false
            });

            // if the file doesnt save
            if(!files){
                return res.status(400).json('Error while uploading the file. Try again later.');
            }

            res.status(200).json({ msg: 'file uploaded', files: {
                fileName: files.fileName,
                    _id: files._id,
                    path: paths,
                    mimetype: mimetype,
                    task_id
                }
            });

        } catch (error) {
            //log if there is any error
            res.status(400).json({ error: "File uploading failed. Please try again"});
        } 
    }
}

//GET all Files
const getFiles = async (req, res) => {
    const { id } = req.params

    // User id both adviser and student
    const user_id = req.user._id;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Access Denied. Please try to login again!"})
        }

        // logs all the Data inside FileUploadModel
        const files = await FileUploadModel.find({ task_id: id });
        // const user = await FileUploadModel.find({ uploader_id: user_id })

        if(!files){
            return res.status(400).json('Error while getting list of files. Try again later.');
        } 

        // sort by date
        const sortedByCreationDate = files.sort(
            (a, b) => b.createdAt - a.createdAt
        );

        res.status(200).json(sortedByCreationDate);

    // catch error
    } catch (error) {
        res.status(400).json('Error while getting list of files. Try again later.');
    }
}


// Get a single File
const getFile = async (req, res) => {
    const { id } = req.params;

    // User id both adviser and student
    const user_id = req.user._id;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Access Denied. Please try to login again!"})
        }
    
        // logs all the Data inside FileUploadModel
        const files = await FileUploadModel.findById({ _id: id });
        const paths = __dirname;
        const downloadPath = path.join(paths,'\\', files.path).replace('Controller/FileUpload/\\', '');

        res.set({
            'Content-Type': files.mimetype
        });
        
         // send the file to the client
         res.download(downloadPath, (err) => {
            if (err) {
                return console.log({error: "Error while downloading file:", message: err.message});
            } else {
              //delete the file first 
              fs.unlink(downloadPath, async (err) => {
                // check is the file exist
                if (err) {
                    return console.log({error: "No file Found!"});
                } else {
                    // update the deleted field to true
                    const updateFile = await FileUploadModel.updateOne({ _id: id }, { $set: { deleted: true } })
                    if(!updateFile){
                        return console.log({error: 'Error please try again'});
                    }
                    return console.log("Deleted File successfully.");
                }

                
                //     , (err) => {
                //   if(err) {
                //     return res.status(400).json('Error please try again');
                //   } else {
                //     return res.status(200).json("Deleted File successfully.");
                //   }
                // });
              });
            }
        });

    // catch error
    } catch (error) {
        res.status(400).json('Error while downloading file. Try again later.');
    }
}


// DELETE a single File
const deleteFile= async (req, res) => {
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
        const file = await FileUploadModel.findOneAndDelete({ _id: id });
        if(!file) {
            return res.status(400).json({error: "Task details deletion failed!"})
        }

        //delete the file
            //path
        const paths = __dirname;
        const downloadPath = path.join(paths,'ManuscriptFiles/')
        
        console.log(paths);
        console.log(downloadPath);
        
            //filename
        const split = file.path.split('\\');
        const filename = split[split.length - 1];
        
        console.log(filename);

        // pass to font end
        fs.unlink(downloadPath + filename, (err) => {
            // error
            if (err) {
                return console.log("File deletion failed!")
            }
            // success
                return console.log("Delete File successfully.");
        });

        res.status(200).json({error: "File deleted successfully!"})
        
    } catch (error) {
        res.status(400).json({error: error.message});
    }
 
 }

module.exports = { createFile, getFiles, getFile, deleteFile };
