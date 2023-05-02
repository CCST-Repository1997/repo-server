const mongoose = require('mongoose');

// User Models
const UserModel = require('../../Model/Roles/UserModel')
const AdminModel = require('../../Model/Roles/AdminModel')
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')

//Models
const GroupsModel = require('../../Model/Groups/GroupsModel')
const ReportModel = require('../../Model/Reports/ReportModel')  
const ManuscriptFilesModel = require('../../Model/FileUpload/ManuscriptModel')
const ProgressModel = require('../../Model/Adviser/ProgressModel')

const getUserDashboard = async( req, res) => {
    // Student ID
    const user_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Access denied: No User Found!"})
        }

        const students = await UserModel.findById({ _id: user_id })
        if(!students){
            return res.status(400).json({ error: 'Access Unauthorized. Pease try to login again!' });
        }

        const getGroupProgress = await ProgressModel.find({ group_id: students.group_id })
        if(!getGroupProgress){
            return res.status(400).json({ error: 'No group progress found. Please check if you have a group' });
        }
        console.log(students.groupName)

        res.status(200).json({ getGroupProgress, groupName: students.groupName });
    } catch (error) {
        res.status(400).json({ error: 'Your Information is not found. Pease try again!' });
    }
}

const getAdminDashboard = async (req, res) => {
    // Adviser ID or admin_id
    const user_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Access denied: No User Found!"})
        }


        // Find the adviser account
        const adminExist = await AdminModel.findById({ _id: user_id })
        if(!adminExist) {
            return res.status(400).json({ error: "No Admin account Found!"});
        }

        // find the ID of the logged in Adviser
        const pending = await UserModel.count({ authorization: 'pending'});
        const student = await UserModel.count({ admin_id: user_id, authorization: 'student'});
        const groups = await GroupsModel.count({ admin_id: user_id });
        const reports = await ReportModel.count({});

        // find the group of the adviser
        const adviserGroups = await ProgressModel.find({ admin_id: user_id }).exec()

        // find the group of the adviser
        const adviseeGroups = await GroupsModel.find({ admin_id: user_id, yearAndSection_id: adminExist.yearAndSection_id })
    
        res.status(200).json({
            pending: pending, 
            student: student, 
            groups: groups, 
            reports: reports,
            adviserGroups: adviserGroups,
            adviseeGroups: adviseeGroups
        });
    } catch (error) {
        res.status(400).json({ error: 'Your Information is not found. Pease try again!' });
    }

    
}

const getSuperAdminDashboard = async (req, res) => {
    // Dean id
    const dean_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( dean_id )) {
            return res.status(400).json({error: "Access Unauthorized!"})
        }

        // check if the id exist
        const dean = await SuperAdminModel.findById(dean_id);
        if(!dean){
            return res.status(400).json({ error: 'Access Unauthorized: No User Found!' });
        }

        // find the ID of the logged in Adviser
        const pending = await UserModel.count({authorization: 'pending'});
        const student = await UserModel.count({authorization: 'student'});
        const admins = await AdminModel.count({})
        const groups = await GroupsModel.count({});
        const manuscriptFiles = await ManuscriptFilesModel.count({});
        const adminAccounts = await AdminModel.find({});

        // response
        res.status(200).json({pending: pending, 
            student: student, groups: groups,
            admins: admins, manuscriptFiles: manuscriptFiles,
            adminAccounts: adminAccounts
        });
    } catch (error) {
        res.status(400).json({ error: 'Your Information is not found. Pease try again!' });
    }
}


module.exports = { getAdminDashboard, getSuperAdminDashboard, getUserDashboard };