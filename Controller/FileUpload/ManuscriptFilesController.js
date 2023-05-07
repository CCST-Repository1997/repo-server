const mongoose = require('mongoose');
const path = require("path")
const fs = require('fs');

//IMPORT MODEL
// users
const UserModel = require('../../Model/Roles/UserModel')
const AdminModel = require('../../Model/Roles/AdminModel')
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')

// models
const GroupsModel = require('../../Model/Groups/GroupsModel');
const ManuscriptModel = require('../../Model/FileUpload/ManuscriptModel')


//CONTROLLER FUNCTIONS
  //POST a new File
const createManuscript = async (req, res) => {
    const { manuscript } = req.body;

    // Manuscript File
    const mimetypeManu = req.files[0].mimetype;
    const pathsManu = req.files[0].path;

    // Abstract File
    const mimetypeAbs= req.files[1].mimetype;
    const pathsAbs = req.files[1].path;

    // User and Task
    const user_id = req.user._id;

    // check if the files has a value
    if(!req.files){
        return res.status(400).json({ error: "No file found!"});
    }
    
    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Access Denied. Please try to login again!"})
        }

        // find the user who uploads the files
        const user = await UserModel.findById({ _id: user_id});

        // check if the user exist
        if(!user){
            return res.status(400).json({ error: "Invalid user authorization!" });
        }

        // find the adviser Model and get its name
        const adviser = await AdminModel.findById({ _id: user.admin_id })

        // gets the academicYear from the GroupsModel
        const group = await GroupsModel.findById({ _id: user.group_id})

        // check if the users group_id exist
        if(!group){
           return res.status(400).json({ error: "No groups Found!" });
        }

        // create the data send to the database
        const files = await ManuscriptModel.create({ 
            // Manuscript file
            manuscript: manuscript, 
            manuscriptPath: pathsManu, 
            manuscriptMimetype: mimetypeManu,
            
            // Abstract file
            abstract: `Abstract: ${manuscript}`,
            abstractPath: pathsAbs,
            abstractMimetype: mimetypeAbs, 

            // info
            user_id: user_id,
            admin_id: user.admin_id,
            adviserName: adviser.name,
            group_id: user.group_id,
            groupName: user.groupName,
            isArchived: false,

            // based on the users academic year from the GroupsModel
            academicYear: group.academicYear,
        });

        // error
        if(!files){
            res.status(400).json('Failed to upload the files. Please try again');
        }

        res.status(200).json({ msg: 'file uploaded', files });

    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    } 
}

// get all the manuscripts
const getAllManuscripts = async (req, res) => {
    // Needs security to check if the one who request is Dean!
    // can be the DEAN or the ADVISER
    const user_id = req.user._id;

    // validate if its an ObjectId
    if(!mongoose.Types.ObjectId.isValid( user_id )) {
        return res.status(400).json({error: "Access Denied. Please try to login again!"})
    }

    //ADVISER
    const adviser = await AdminModel.findById(user_id)
    if(adviser){
        if(adviser.authorization !== 'admin'){
            return res.status(400).json({ error: 'Unaothorized Access'})
        }

        const ManiscrptFiles = await ManuscriptModel.find({ admin_id: adviser._id });

        //logs if no file found!
        if(!ManiscrptFiles){
            return res.status(400).json({ error: "No file found!"});
        }

        return res.status(200).json(ManiscrptFiles);
    }

    //DEAN
    const dean  = await SuperAdminModel.findById(user_id)
    if(dean){
        if(dean.authorization !== 'superadmin'){
            return res.status(400).json({ error: 'Unaothorized Access'})
        }

        // logs all the Id inside workoutModel
        const ManiscrptFiles = await ManuscriptModel.find({});

        //logs if no file found!
        if(!ManiscrptFiles){
           return res.status(400).json({ error: "No file found!"});
        }

        return res.status(200).json(ManiscrptFiles)

    } else {
        return res.status(400).json({ error: 'Unaothorized Access'})
    }
}   

// DELETE a Manuscript File
const deleteManuscript = async (req, res) => {
    const { id } = req.params;
  
    try {
      // validate if its an ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid id format." });
      }
  
      // Find "id" if there is the same "ObjectId" in Database and Delete the data
      const file = await ManuscriptModel.findOneAndDelete({ _id: id });
  
      if (!file) {
        return res.status(400).json({ error: "No file found." });
      }
  
      // Manuscript
      // path
      const manuscriptPath = __dirname;
    //   const manuscriptPath = __dirname.slice(0, 43);
      const manuscriptDownloadPath = path.join(
        manuscriptPath,
        'ManuscriptFiles/'
      ).replace('Controller/FileUpload/', '');
  
      // filename
      const manuscriptSplit = file.manuscriptPath.split("/");
      const manuscriptFilename = manuscriptSplit[manuscriptSplit.length - 1];
  
      // Abstract
      // path
      const abstractPath = __dirname
    //   const abstractPath = __dirname.slice(0, 43);
      const abstractDownloadPath = path.join(abstractPath, 'ManuscriptFiles/').replace('Controller/FileUpload/', '');
  
      // filename
      const abstractSplit = file.abstractPath.split("/");
      const abstractFilename = abstractSplit[abstractSplit.length - 1];
  
      console.log("Manuscript download path:", manuscriptDownloadPath, manuscriptFilename)
      console.log("Abstract download path:", abstractDownloadPath, abstractFilename);

      
    let completed = 0; // initialize counter variable

    if (fs.existsSync(manuscriptDownloadPath + manuscriptFilename)) {

        //   delete manuscript file
        fs.unlink(manuscriptDownloadPath + manuscriptFilename, (err) => {
            if (err) {
            return res.status(400).json({ error: "Error deleting manuscript file." });
            }
            completed++; // increment counter variable
            if (completed === 2) { // check if both fs.unlink methods have completed
                res.status(200).json("File successfully deleted.");
            }
        }); 
    } else {
        console.log("No file found in Manuscript")
    }

    if (fs.existsSync(abstractDownloadPath + abstractFilename)) {
  
      // delete abstract file
      fs.unlink(abstractDownloadPath + abstractFilename, (err) => {
        if (err) {
          return res.status(400).json({ error: "Error deleting abstract file." });
        }
        completed++; // increment counter variable
        if (completed === 2) { // check if both fs.unlink methods have completed
          res.status(200).json("File successfully deleted.");
        }
      });
    } else{
        console.log("No file found in Abstract")
    }

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


// Get a Download Manuscript File
const getSingleManuscript = async (req, res) => {
    const { id } = req.params;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( id )) {
            return res.status(400).json({error: "Invalid file id!"})
        }

        // logs all the Data inside FileUploadModel
        const files = await ManuscriptModel.findById({ _id: id });

        if(!files){
            return res.status(400).send('No file found.');
        }

        const paths = __dirname;
        // const paths = __dirname.slice(0, 43)

        res.set({
            'Content-Type': files.manuscriptMimetype
        });
        const downloadPath = path.join(paths,'\\', files.manuscriptPath).replace('Controller/FileUpload/\\', '');
        
        res.sendFile(downloadPath)

    // catch error
    } catch (error) {
        res.status(400).send('Error while downloading file. Try again later.');
    }
}


module.exports = {  createManuscript, getAllManuscripts, deleteManuscript, getSingleManuscript };
