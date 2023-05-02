const jwt = require('jsonwebtoken')
const UserModel = require('../Model/Roles/UserModel')
const AdminModel = require('../Model/Roles/AdminModel')
const SuperAdminModel = require('../Model/Roles/SuperAdminModel')

const requireAuth = async(req, res, next) => {

    //verify authentication
    const { authorization } = req.headers

    if( !authorization ){
        return res.status(401).json({error: 'Authorization token is required'})
    }

    //split the 'bearer' and 'token' via ' '(space)
    const token = authorization.split(' ')[1]


    try {
        // verify the token and deconstruct the '_id' from the token
        const { _id } = jwt.verify(token, process.env.SECRET)

        //store to 'req.user' the selected '_id' of the user who is logged in
        // Student
        req.user = await UserModel.findOne({ _id }).select('_id')
        if(req.user){
            return next()
        }
        // Adviser
        req.user = await AdminModel.findOne({ _id }).select('_id')
        if(req.user){
            return next()
        }

        //Dean
        req.user = await SuperAdminModel.findOne({ _id }).select('_id')
        if(req.user){
            return next()
        }
        
        //proceed to the routes
        next()

    //catch error
    } catch (error) {
        console.log(error)
        res.status(401).json({error: 'Request is not authorized'})
    }
}

module.exports = requireAuth;
