const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const validator = require('validator')

const adminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    authorization: {
        type: String,
        required: true,
    },
    groupsTotalPercent:{ 
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    isArchived:{
        type: Boolean,
        required: true,
    },
    yearAndSection_id: { 
        type: String
    },
    

}, { timestamps: true});
// timestamps - makes a "createdAt" and "updatedAt" everytime we create a workout.


// Static Register method
adminSchema.statics.register = async function( name, password, email, isArchived ) {

    // Form validation
        //check if all field has a value
    console.log( name, password, email )
    if(!name || !email || !password ){
        throw Error('All fields must be filled!')
    }
    
        //check if the email is valid
    if( !validator.isEmail( email ) ){
        throw Error('Email is not valid!')
    }

        //check if the password is strong
    if( !validator.isStrongPassword(password) ) {
        throw Error('Your password is weak')
    }
    
    
    // check there is an existing email and section
    const emailExists = await this.findOne({ email })

    if(emailExists){
        throw Error('Email is already in use!')
    }

    // hashing and salting password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    //for students account 
    const authorization = 'admin';

    // saving the admin form
    const admin = await this.create({ 
                name, 
                password: hash, 
                email,
                authorization: authorization, 
                isArchived,
                groupsTotalPercent: 0 })
    
    // returns the admin data
    return admin;
}


module.exports = mongoose.model('AdminAccount', adminSchema);