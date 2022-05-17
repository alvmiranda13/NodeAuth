const User = require('../models/user')
const jwt = require('jsonwebtoken');
const { response } = require('express');

//handel erros
const handelErrors = (err)=>{
    console.log(err.message, err.code);
    let errors = {email:'', password:''};
    // duplicate rror code
    if(err.code === 11000){
        errors.email = 'that email already exists'
        return errors;
    }
    //validation errors
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) =>{
            errors['properties.path'] = properties.message;
        })
    }
    return errors;
}
// age of token
const maxAge = 3* 24 * 60 * 60;
//creates token
const createToken = (id)=>{
    return jwt.sign({ id },'net ninja secret', {
        expiresIn: maxAge
    });
}

module.exports.signup_get = (req,res)=>{
    res.render('signup')
}
module.exports.login_get = (req,res)=>{
    res.render('login')
}
module.exports.signup_post = async (req,res)=>{
    // we want to grab these
    const {email, password} = req.body;
    //try to create a user with these properties by using a try catch 
    try{
        // async returns a promise
        const user = await User.create({email, password})
        // create token
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
        res.status(201).json({user: user._id});
    }catch(err){
        // if there is an err
        const errors = handelErrors(err);
        res.status(400).json({ errors });
        //dont put res send here!!!
    }
}
module.exports.login_post = async (req,res)=>{
    const {email, password} = req.body;
    try{
        const user = await User.login(email,password);
        response.status(200).json({user: user._id});
        console.log('logged in')
    }catch(err){
        res.status(400).json({})
    }
}