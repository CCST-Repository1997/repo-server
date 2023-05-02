const mongoose = require('mongoose');

//Models
const UserModel = require('../../Model/Roles/UserModel')
const AdminModel = require('../../Model/Roles/AdminModel');
const SuperAdminModel = require('../../Model/Roles/SuperAdminModel')

// Models
const GroupsModel = require('../../Model/Groups/GroupsModel');



//Dean
const getAllStudents = async (req, res) => {
    // adviser id taken
    const { id } = req.params

    // logged in dean id taken
    const user_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error! Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking for dean
        const dean = await SuperAdminModel.findById( user_id )
        if(!dean || !dean.authorization === 'superadmin'){
            return res.status(400).json({ error: "Unauthorized Access!"});
        }

        // find the students of adviser id taken
        const users = await UserModel.find({ admin_id: id })
        if(!users) {
            return res.status(400).json({ error: "No Students Found!"});
        }

        res.status(200).json(users);
    
    // catch error
    } catch (error) {
        return res.status(401).json({ 
            error: "An error occurred while fetching your students: " + error 
        });
    }
}

const deleteStudent = async (req, res) => {

}

const getAllGroups = async (req, res) => {
    // adviser id taken
    const adviser_id = req.params.id

     // dean id taken
     const user_id = req.user._id

     try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error no adviser found!"})
        }

        // Authorization checking for dean
        const dean = await SuperAdminModel.findById( user_id )
        if(!dean || !dean.authorization === 'superadmin'){
            return res.status(400).json({ error: "Unauthorized Access!"});
        }

        // get all the groups of that adviser id
        const groups = await GroupsModel.find({ admin_id: adviser_id })
        if(!groups) {
            return res.status(400).json({ error: "No groups Found!"});
        }

        res.status(200).json(groups);

    // catch error
    } catch (error) {
        return res.status(401).json({ 
            error: "An error occurred while fetching the groups: " + error 
        });
    }
}


//Adviser
const getAllStudentsAdmin = async (req, res) => {
    // adviser id taken
    const user_id = req.user._id

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error no adviser found!"})
        }

        // Authorization checking for adviser
        const adviser = await AdminModel.findById( user_id )
        if(!adviser || !adviser.authorization === 'admin'){
            return res.status(400).json({ error: "Unauthorized Access!"});
        }

        // find the student of that adviser id
        const users = await UserModel.find({ admin_id: user_id })
        if(!users) {
            return res.status(400).json({ error: "No Students Found!"});
        }

        res.status(200).json(users);

    // catch error
    } catch (error) {
        return res.status(401).json({ 
            error: "An error occurred while fetching the students: " + error 
        });
    }  
}

const getAllGroupsAdmin = async (req, res) => {
     // logged in adviser id taken
     const user_id = req.user._id

     try {
         // validate if its an ObjectId
         if(!mongoose.Types.ObjectId.isValid( user_id )) {
             return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
         }
 
         // Authorization checking for adviser
         const adviser = await AdminModel.findById( user_id )
         if(!adviser || !adviser.authorization === 'admin'){
             return res.status(400).json({ error: "Unauthorized Access!"});
         }

        // find the ID of the logged in Adviser
        const groups = await GroupsModel.find({ admin_id: user_id })
        if(!groups) {
            return res.status(400).json({ error: "No groups Found!"});
        }

        res.status(200).json(groups);

    // catch error   
    } catch (error) {
        return res.status(401).json({ 
            error: "An error occurred while fetching your groups: " + error 
        });
    }


    
}


module.exports = {getAllStudents, deleteStudent, getAllGroups,
                    getAllStudentsAdmin, getAllGroupsAdmin
};