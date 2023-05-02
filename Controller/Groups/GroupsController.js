const mongoose = require('mongoose');
const path = require("path")
const fs = require('fs');

// Users Model
const AdminModel = require('../../Model/Roles/AdminModel')
const AcademicYearModel = require('../../Model/Dean/AcademicYearModel')
const YearAndSectionModel = require('../../Model/Dean/YearAndSectionModel')

// Models
const GroupsModel = require('../../Model/Groups/GroupsModel');
const ProgressModel = require('../../Model/Adviser/ProgressModel')
const CommentModel = require('../../Model/Progress/CommentsModel')
const ReportModel = require('../../Model/Reports/ReportModel')

// Task Model
const TaskModel = require('../../Model/Progress/CreateTaskModel')
const StudentTaskFileModel = require('../../Model/FileUpload/StudentTaskModel')
const AdviserTaskFileModel = require('../../Model/FileUpload/FileUploadModel')

// Manuscript and Abstract Model
const ManuscriptAndAbstractModel = require('../../Model/FileUpload/ManuscriptModel')


// Controller for the selection in Register Page
const groupSelection = async (req, res) => {
    try {
        // logs all the Id inside workoutModel
        const group = await GroupsModel.find({})

        if(!group) {
            return res.status(400).json({ error: "No groups Found!"});
        }

        res.status(200).json(group);
    
    // error
    } catch (error) {
        res.status(400).json({ error: "Error please try again" });
    }
}

// POST a new group
const createGroup = async (req, res) => {
    const { groups } = req.body; 

    //admin_id taken
    const user_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
        }

        // Find the academicYear from the "AdminModel"
        const findAdviser = await AdminModel.findById( user_id )
        if(!findAdviser){
            return res.status(400).json({ error: "Access denied. Your account is unauthorized"});
        }

        // Find from the "YearAndSectionModel"
        const yearAndSection = await YearAndSectionModel.findById( findAdviser.yearAndSection_id )
        if(!yearAndSection){
            return res.status(400).json({ error: "Your account needs to have a Year and Section. Ask your Dean first"});
        }

        // create the group data send to the database
        const group = await GroupsModel.create({ 
            groups, 
            admin_id: user_id, 
            isArchived: false, 
            totalAveragePercent: 0, 
            academicYear: yearAndSection.academicYear,
            section: yearAndSection.section,
            yearAndSection_id: yearAndSection._id
        });

        // error
        if(!group){
            return res.status(400).json({ error: "The group failed to save. Please try again"});
        }
            
        res.status(200).json(group);

    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}

// POST rename a group
const renameGroups = async(req, res) => {
    // rename data
    const { renameGroup, group_id } = req.body

    //admin_id taken
    const user_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
        }

        // Find the academicYear from the "AdminModel"
        const findAdviser = await AdminModel.findById( user_id )
        if(!findAdviser){
            return res.status(400).json({ error: "Access denied. Your account is unauthorized"});
        }

        // check the value
        if(!renameGroup || !group_id){
            return res.status(400).json({ error: "No group found. Please try again"});
        }

        // Find "id" if there is the same "ObjectId" in Database and update the group name
        const updateGroupName = await GroupsModel.updateOne(
            // the student id
            { _id: group_id }, 

            //data to update
            { $set: 
                {     
                    groups: renameGroup
                }}
        );

        // check if the update failed
        if(!updateGroupName){
            return res.status(400).json({ error: "Failed to update the group name. Please try again."});
        }

        // send the update
        res.status(200).json(updateGroupName);

    // catch error
    } catch (error) {
        //log if there is any error
        res.status(400).json({ error: error.message});
    }
}

// GET all groups by adviser
const getGroups = async (req, res) => {
    //admin_id taken
    const user_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
        }

        // check if the adviser exist
        const adviser = await AdminModel.findById(user_id);
        if(!adviser){
            return res.status(400).json({ error: "Unauthorized access. You dont have permission to access this" });
        }

        // find all the group of that adviser
        const group = await GroupsModel.find({ admin_id: user_id, yearAndSection_id: adviser.yearAndSection_id });
        if(!group || group.length === 0 ){
            return res.status(400).json({ error: "No group found. Please create a group first" });
        }

        // use to show all the acamedic year when archived
        const academicYear = await AcademicYearModel.find();
        if(!academicYear || academicYear.length === 0 ){
            return res.status(400).json({ error: "No group Academic year found. Please ask the dean first" });
        }

        res.status(200).json({ group, academicYear });

    // catch error
    } catch (error) {
        return res.status(401).json({ error: error });
    }
    
}

// DELETE a single group
const deleteGroup = async (req, res) => {
    // group_id taken
    const {id} = req.params;

    //admin_id taken
    const admin_id = req.user._id

    try {
        //          VALIDATION OF ID
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( admin_id )) {
            return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
        }

        // check if the adviser exist
        const adviser = await AdminModel.findById(admin_id);
        if(!adviser){
            return res.status(400).json({ error: "Unauthorized access. You dont have permission to access this" });
        }

        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
        }


        //          DELETE QUERY
        // Find the group to delete
        const findGroup = await GroupsModel.findById( id );
        if(!findGroup){
            return res.status(400).json({error: "The group you selected is not registerd to the system. Please try again!"})
        }


        // DATA CONNECTED TO THE GROUP_ID THAT WILL BE DELETED
        // 1) Progress
            const deleteProgress = await ProgressModel.deleteMany({ group_id: id })
            if(!deleteProgress){
                return res.status(400).json({error: `All progress deletion under ${findGroup.groups} failed. Please try again!`})
            }

        // 2) Task infos
            const deleteTaskInfos = await TaskModel.deleteMany({ group_id: id })
            if(!deleteTaskInfos){
                return res.status(400).json({error: `All task deletion under ${findGroup.groups} failed. Please try again!`})
            }

        // 3) Task files
            // STUDENT
            const deleteStudentTaskFile = await StudentTaskFileModel.deleteMany({ group_id: id })
            if(!deleteStudentTaskFile){
                return res.status(400).json({error: `All task files deletion under ${findGroup.groups} of the student failed. Please try again!`})
            } 

            //ADVISER
            const deleteAdviserTaskFile = await AdviserTaskFileModel.deleteMany({ group_id: id })
            if(!deleteAdviserTaskFile){
                return res.status(400).json({error: `All task files deletion under ${findGroup.groups} of your group advisee failed. Please try again!`})
            } 

        // 4) Submitted report of students
            const deleteReports = await ReportModel.deleteMany({ group_id: id })
            if(!deleteReports){
                return res.status(400).json({error: `All reports deletion under ${findGroup.groups} failed. Please try again!`})
            }
        
        // 5) Comments
            const deleteComments = await CommentModel.deleteMany({ group_id: id })
            if(!deleteComments){
                return res.status(400).json({error: `All comments deletion under ${findGroup.groups} failed. Please try again!`})
            }

        // 6) Manuscript & abstract
            const deleteManuscriptAndAbstract = await ManuscriptAndAbstractModel.deleteMany({ group_id: id })
            if(!deleteManuscriptAndAbstract){
                return res.status(400).json({error: `All manuscripts and abstracts deletion under ${findGroup.groups} failed. Please try again!`})
            }

        // 7) Group
            const group = await GroupsModel.findOneAndDelete({_id: id});
            if(!group) {
                return res.status(400).json({error: "Failed to delete the group. Please try again!"})
            }
    
        // logs the Id found on the server!
        res.status(200).json(`Group of ${findGroup.groups} deletion succeed. Including the following that are connected to the group: Progress, Task, Student task files, Adviser task files, Comments, Reports. Manuscripts and Abstracts`);
        
    // error
    } catch (error) {
        return res.status(401).json({ error: error });
    }
}
 

module.exports = {groupSelection, createGroup, renameGroups, getGroups, deleteGroup};