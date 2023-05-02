const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const validator = require('validator')

//Model components
const GroupsModel = require('../Groups/GroupsModel')
const AdminModel = require('./AdminModel')
const SuperAdminModel = require('./SuperAdminModel')

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    admin_id:{
        type: String
    },
    password: {
        type: String,
        required: true
    },
    group_id: {
        type: String,
        required: true
    },
    groupName: {
        type: String,
        required: true
    },
    studentID: {
        type: String,
        required: true,
        unique: true
    },
    authorization: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    position:{
        type: String,
        required: true
    }, 
    yearAndSection_id: {
        type: String,
        required: true
    },
    section: {
        type: String
    },
    isArchived:{
        type: Boolean,
    }
}, { timestamps: true});
// timestamps - makes a "createdAt" and "updatedAt" everytime we create a workout.


// Static Signup method
userSchema.statics.signup = async function( name, email, studentID, groupName, password, position, yearAndSection_id, group_id ) {

    // Form validation
        //check if all field has a value
    if(!name || !email || !studentID || !groupName || !password || !position || !yearAndSection_id || !group_id){
        throw Error('All fields must be filled!')
    }
    
        //check if the email is valid
    if( !validator.isEmail( email ) ){
        throw Error('Email is not valid!')
    }

        //check if the password is strong
    if( !validator.isStrongPassword(password) ) {
        throw Error(`Your password must contain:
                        - Minimum of 8 characters
                        - Number
                        - Uppercase letter
                        - Lower case letter
                        - Symbols eg. !@#$%^&*`)
    }


    // check there is an existing email from Admin Model
    const adminExists = await AdminModel.findOne({ email })
    if(adminExists){
        throw Error('Username is already in use!')
    }
    
    // check there is an existing email
    const userExists = await this.findOne({ email })
    if(userExists){
        throw Error('Username is already in use!')
    }

    // check there is an existing studentID
    const studentIDExist = await this.findOne({ studentID })
    if(studentIDExist){
        throw Error('Student ID is already in use!')
    }

    // check if the groupName is valid
    const groupExists = GroupsModel.findById({  _id: group_id })

    if(!groupExists){
        throw Error('No group found!')
    }

    // hashing and salting password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    //for students account 
    const authorization = 'pending';

    // saving the user form
    const user = await this.create({
        name, 
        password: hash, group_id,
        groupName, 
        email, 
        studentID, 
        position, 
        yearAndSection_id, 
        authorization: authorization })
    
    // returns the user data
    return user;
}


// Static Login method
userSchema.statics.login = async function( email, password ) {

    if( !email || !password ) {
        throw Error('All fields must be filled!')
    }

//Student Login Authentication
    // validate the email if it exist in database
    const userEmail = await this.findOne({ email })
    
    // validate the studentID if it exist in database
    const userID = await this.findOne({ studentID: email })

    //STUDENT: if email and student ID exist
    if(userEmail || userID){
        //if the email exist
        if (userEmail){
            //Check if user is archived
            if(userEmail.isArchived) {
                throw Error('This account has been archived and is no longer accessible.')
            }

            const matchPassword = await bcrypt.compare(password, userEmail.password)
    
            if(!matchPassword) {
                throw Error('Incorrect Password')
            }   
    
            return userEmail
        }

        //ADVISER: if the studentID doesn't exist 
        if(userID) {
            // validate the studentID if it exist in database
            const userID = await this.findOne({ studentID: email })

            //Check if user is archived
            if(userID.isArchived) {
                throw Error('This account has been archived and is no longer accessible.')
            }

            const matchPassword = await bcrypt.compare(password, userID.password)

            if(!matchPassword) {
                throw Error('Incorrect Password')
            }   
            return userID
        }
    }


    // Admin Account Authentication
        const adminEmail = await AdminModel.findOne({ email })

        //check if there is an admin email
        if(adminEmail){
            //Check if admin is archived
            if(adminEmail.isArchived) {
                throw Error('This account has been archived and is no longer accessible.')
            }

            const matchPassword = await bcrypt.compare(password, adminEmail.password)

            if(!matchPassword ){
                throw Error('Incorrect Password')
            }

            return adminEmail
        }

    // Super Admin Account Authentication
        const superAdminEmail = await SuperAdminModel.findOne({ email })

            //check if there is an super admin email
            if(superAdminEmail){
                // checked the hashed password if matched
                const matchPassword = await bcrypt.compare(password, superAdminEmail.password)

                // catch error if not match
                if(!matchPassword ){
                    throw Error('Incorrect Password')
                }

                return superAdminEmail
            }

    //Global username error
    if( !userEmail || !adminEmail || !superAdminEmail || !userID ){
        throw Error('Incorrect Username')
    }
    
}
 
module.exports = mongoose.model('UserAccounts', userSchema);