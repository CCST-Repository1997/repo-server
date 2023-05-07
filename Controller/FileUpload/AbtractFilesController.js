const mongoose = require('mongoose');
const path = require("path")
const fs = require('fs');

//IMPORT MODEL
const ManuscriptModel = require('../../Model/FileUpload/ManuscriptModel')

//CONTROLLER FUNCTIONS
  // DELETE a single Abstract File
const deleteAbstract = async (req, res) => {
    // manuscript id
    const { id } = req.params;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( id )) {
            return res.status(400).json({error: "No file Found!"})
        }

        // // Find "id" if there is the same "ObjectId" in Database and Delete the data
        const file = await ManuscriptModel.findOneAndDelete({ _id: id });

        if(!file) {
            return res.status(400).json({error: "No file Found!"})
        }

        //delete the file
            //path
        const paths = __dirname;
        // const paths = __dirname.slice(0, 43)
        const downloadPath = path.join(paths,'\\ManuscriptFiles\\')
            //filename
        const split = file.path.split('\\');
        const filename = split[split.length - 1];

        // pass to front end
        fs.unlink(downloadPath + filename, (err) => {
            if (err) {
                return res.status(400).json({error: "No file Found!"})
            }
            
            // logs the Id found on the server!
            res.status(200).json(file); 
        });

    // catch error
    } catch (error) {
        res.status(400).send('Error while deleting the file. Please try again');
    }   
 }


  // Get a single Abstract File
const getSingleAbstract = async (req, res) => {
    // manuscript id
    const { id } = req.params;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( id )) {
            return res.status(400).json({error: "No file Found!"})
        }

        // logs all the Data inside FileUploadModel
        const files = await ManuscriptModel.findById({ _id: id });
        if(!files){
            return res.status(400).json({error: "No file Found!"})
        }

        // directory path
        const paths = __dirname
        // const paths = __dirname.slice(0, 43)

        res.set({
            'Content-Type': files.abstractMimetype
        });

        const downloadPath = path.join(paths,'\\', files.abstractPath).replace('Controller/FileUpload/\\', '');
        
        res.sendFile(downloadPath)

    // catch error
    } catch (error) {
        res.status(400).send('Error while downloading file. Try again later.');
    }
}


module.exports = { deleteAbstract, getSingleAbstract };
