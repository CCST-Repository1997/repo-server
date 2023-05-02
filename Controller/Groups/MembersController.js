const UserModel = require('../../Model/Roles/UserModel')
const AdminModel = require('../../Model/Roles/AdminModel')
const mongoose = require('mongoose');

// Get all the member of a specific group
const getmembers = async (req, res) => {
    //group_id param
    const { id } = req.params;

    //student id or adviser id taken
    const user_id = req.user._id 

    try {
        // validate if its an ObjectId
        if(!mongoose.Types.ObjectId.isValid( user_id )) {
            return res.status(400).json({error: "Error Access Unauthorized. Please try to login again!"})
        }

        // Authorization checking
        const student = await UserModel.findById(user_id)
        const adviser = await AdminModel.findById(user_id)

        //Check if one of student or adviser account is true
        if(student || adviser){
            // find the members of that group_id || group_id: id || admin_id: user_id 
            const members = await UserModel.find({ group_id: id, authorization: 'student' })
            if( !members || members.length === 0 ) {
                return res.status(400).json({ error: "No Members Found!"});
            }

            // send the group members
            return res.status(200).json(members);

        // error
        } else {
            return res.status(400).json({ error: "Access Denied. You are not a registered student!"});
        }

    // catch error
    } catch (error) {
        return res.status(401).json({ 
            error: "An error occurred while fetching group members: " + error 
        });
    }
}


module.exports = { getmembers };