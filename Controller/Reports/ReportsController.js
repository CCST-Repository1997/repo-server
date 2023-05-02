const ReportModel = require('../../Model/Reports/ReportModel');
const UserModel = require('../../Model/Roles/UserModel')
const AdminModel = require('../../Model/Roles/AdminModel')
const mongoose = require('mongoose');   

//STUDENT:  a new Report
const createReport = async (req, res) => {
    const { input, optionArr, reportedMembersArr, group_id } = req.body; 

    //admin_id or student taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking: find the student
        const user = await UserModel.findById({ _id: user_id })
        if(!user){
            return res.status(400).json({error: "Error! Access Unauthorized. No user found!"})
        }

        // check if all the req.body has a value
        if(!input || !optionArr || !reportedMembersArr || !group_id ){
            return res.status(400).json({error: "Please fill in all the blank fields and try to send your report again."})
        }

        // create the data send to the database
        const reports = await ReportModel.create({ input, optionArr, reportedMembersArr, group_id }); 
        if(!reports){
            return res.status(400).json({error: "Error the report didn't save. Please try again!"})
        }
        
        //send the data
        res.status(200).json(reports);

    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}

//ADVISER: GET all Reports
const getReports = async (req, res) => {
    // group_id
    const { id } = req.params;

    //admin_id or student taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // find the student
        const adviser = await AdminModel.findById({ _id: user_id })
        if(!adviser){
            return res.status(400).json({error: "Error! Access Unauthorized. No user found!"})
        }

        // logs all the Id inside workoutModel
        const reports = await ReportModel.find({ group_id: id });
        if(!reports){
            return res.status(400).json({error: "No reports found. Please wait for your students to send a report first."})
        }

        // send all the reports of a group
        res.status(200).json(reports);

        
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }

    
}

//ADVISER: DELETE a single Report
const deleteReport = async (req, res) => {
    const { id } = req.params;

    //admin_id or student taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( id )) {
            return res.status(400).json({error: "No reports Found!"})
        }
    
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // find the student
        const adviser = await AdminModel.findById({ _id: user_id })
        if(!adviser){
            return res.status(400).json({error: "Error! Access Unauthorized. No user found!"})
        }

        // Find "id" if there is the same "ObjectId" in Database and Delete the data
        const reports = await ReportModel.findOneAndDelete({ _id: id });
        if(!reports) {
            return res.status(400).json({error: "The deletion failed. No reports found!"})
        }
    
        // sends that the deletion is a success
        res.status(200).json(reports);
        
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
 }


module.exports = { createReport,
                    getReports, deleteReport };