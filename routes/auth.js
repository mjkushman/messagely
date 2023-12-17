const express = require("express")
const router = new express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config');
const ExpressError = require('../expressError');


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req,res,next) => {
    // get username and pw from request body
    try {
        const { username, password } = req.body;
    
        // Throw error if either username or pw are not provided
        if(!username || !password){
            throw new ExpressError("Username and password are required", 400)
        }
        
        if(await User.authenticate(username,password)){
            // Upon successful auth
            let token = jwt.sign({username}, SECRET_KEY)
            
            await User.updateLoginTimestamp(username)
            return res.json({token})
        } else{
            // upon unsuccessful auth
            throw new ExpressError("Invalid credentials", 400)
        }
    } catch (e) {
        return next(e)
    }


})



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req,res,next) => {
    const {username, password, first_name, last_name, phone} = req.body;

    try{
        // check for all fields
        if(!username || !password){
            throw new ExpressError("Username and password are required", 400)
        }
        // register method will hash the password
        let user = await User.register(req.body)
    
        User.updateLoginTimestamp(user.username)
    
        let token = jwt.sign({username: user.username}, SECRET_KEY)
    
        return res.json({token})
    }
    catch(e){
        return next(e)
    }
})


module.exports = router;