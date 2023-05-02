const mongoose = require('mongoose');   

// Users
const AdminModel = require('../../Model/Roles/AdminModel')
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')

//jsonwebtoken
const jwt = require('jsonwebtoken');
const ManuscriptModel = require('../../Model/FileUpload/ManuscriptModel');

//funtion to create a token
const createToken = (_id) => {
                    //user _id     //env. variable     //token expiry date
    return jwt.sign( {_id: _id }, process.env.SECRET, { expiresIn: '5h' }) 
}

//POST a new Report
const signupAdmin = async (req, res) => {
    const { name, email, password } = req.body; 
    const isArchived = false;

    try {
        // create the data send to the database
        const Admin = await AdminModel.register( name, password, email, isArchived ); 
        const token = createToken(Admin._id)
        res.status(200).json({ name, token, authorization: Admin.authorization });
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}


//ADVISER: DELETE a single Report 
const deleteReport = async (req, res) => {
    // report id taken
    const { id } = req.params;
    
    //adviser id taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking: find the adviser
        const adviser = await AdminModel.findById({ _id: user_id })
        if(!adviser){
            return res.status(400).json({error: "Error! Access Unauthorized. No user found!"})
        }

        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( id )) {
            return res.status(400).json({error: "No reports Found!"})
        }

        // Find "id" if there is the same "ObjectId" in Database and Delete the data
        const reports = await ReportModel.findOneAndDelete({ _id: id });
        if(!reports) {
            return res.status(400).json({error: "No reports Found!"})
        }

        // send that deletetion is a success
        res.status(200).json(reports);

    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
 }


//DEAN: GET all Adviser Accounts
const getAllAdviser = async (req, res) => {

    // Dean id
    const dean_id = req.user._id;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( dean_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking: find the dean
        const dean = await SuperAdminModel.findById(dean_id)
        if(!dean || dean.authorization !== 'superadmin'){
           return res.status(400).json({error: "Error Unathorized Access. Please try to login on your real account"});
        }

        // logs all the adviser accounts
        const getAdmin = await AdminModel.find({});
        if(!getAdmin){
            return res.status(400).json({error: "No adviser found. Please create adviser account first"});
        }

        // send all the adviser accounts
        res.status(200).json(getAdmin);
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}


//DEAN: GET all Manuscript
const getAllgroups = async (req, res) => {
 // selected admin id || adviser
    const { id } = req.params;

    // Dean id
    const dean_id = req.user._id;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( dean_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }
        
        // Authorization checking: find the dean
        const dean = await SuperAdminModel.findById(dean_id)
        if(!dean || dean.authorization !== 'superadmin'){
           return res.status(400).json({error: "Error Unathorized Access. Please try to login on your real account"});
        }

        // shows the manuscript by adviser
        const getManuscripts = await ManuscriptModel.find({ admin_id: id });
        if (!getManuscripts || getManuscripts.length === 0) {
            return res.status(400).json({ error: "No Manuscript and Abstract Files found!" });
        }

        // send all the manuscripts and abstracts
        res.status(200).json(getManuscripts);
        
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }  
}

//DEAN: DELETE a single adviser account
const deleteSingleAdviser = async (req, res) => {
    //adviser id taken
    const { adviser_id } = req.params

    // Dean id
    const dean_id = req.user._id;

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( dean_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }
        
        // Authorization checking: find the dean
        const dean = await SuperAdminModel.findById(dean_id)
        if(!dean || dean.authorization !== 'superadmin'){
           return res.status(400).json({error: "Error Unathorized Access. Please try to login on your real account"});
        }

        // Find the adviser id
        const adviser = await AdminModel.findOneAndDelete({ _id: adviser_id })
        if(!adviser){
            return res.status(400).json({error: "Error! No adviser account found."})
        }

        // logs the adviser account
        res.status(200).json({ mssg: "The adviser account is succesfuly removed"});
        
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    } 
}


module.exports = { signupAdmin, deleteReport, 
                    getAllAdviser, getAllgroups,
                    deleteSingleAdviser,
                };