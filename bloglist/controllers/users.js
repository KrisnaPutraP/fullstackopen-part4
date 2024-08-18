const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// GET /api/users
usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1})
    response.json(users)
})

// POST /api/users
usersRouter.post('/', async (request, response) => {
    const {username, name, password} = request.body

    // if the user already exists, return an error
    if (await User.findOne({username})) {
        return response.status(400).json({error: 'username already exists'})
    }

    // if the password is less than 3 characters, return an error
    if (password.length < 3) {
        return response.status(400).json({error: 'password must be at least 3 characters long'})
    }

    // if the username is less than 3 characters, return an error
    if (username.length < 3) {
        return response.status(400).json({error: 'username must be at least 3 characters long'})
    }

    // hash the password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // create and save the user
    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter