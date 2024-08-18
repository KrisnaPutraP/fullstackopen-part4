const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

/* The login route is responsible for authenticating users. The route expects a JSON object in the following format:
 {
   "username": "example",
   "password": "password"
 }
The route will respond with a JSON object containing a token and the user's username and name. The token is signed using the jsonwebtoken package and the user's id and username. The token is set to expire in 60*60 seconds (1 hour).
If the username is not found in the database, or the password is incorrect, the route will respond with a 401 Unauthorized status code and a JSON object containing an error message. */
loginRouter.post('/', async (request, response) => {
    const {username, password} = request.body

    const user = await User.findOne({username})
    const passwordCorrect = user === null   // if user is null, passwordCorrect is false
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {   // if user is null or password is incorrect
        return response.status(401).json({error: 'invalid username or password'})
    }

    const userForToken = {  
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET, {expiresIn: 60*60})    // token expires in 1 hour

    response
        .status(200)
        .send({token, username: user.username, name: user.name})
})

module.exports = loginRouter
