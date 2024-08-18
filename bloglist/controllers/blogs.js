const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// GET /api/blogs
blogsRouter.get('/', async (request, response) => {    
    const blogs = await Blog.find({}).populate('author', { username: 1, name: 1 })
    response.json(blogs)
})

// POST /api/blogs
blogsRouter.post('/', async (request, response, next) => {
    const body = request.body
    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    
    const blog = new Blog({
        title: body.title,
        author: user.id,
        url: body.url,
        likes: body.likes
    })

    if (!blog.title || !blog.url) {
        return response.status(400).json({ error: 'title or url missing!' })
    }

    if (!blog.likes) {
        blog.likes = 0
    }
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)   
    response.status(201).json(savedBlog)
})

// DELETE /api/blogs/:id
blogsRouter.delete('/:id', async (request, response, next) => {
    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    if (blog.author.toString() !== user._id.toString()) {
        return response.status(401).json({ error: 'unauthorized user!' })
    }

    user.blogs = user.blogs.filter(b => b.toString() !== request.params.id)

    await Blog.findByIdAndDelete(request.params.id) 
    response.status(204).end()
})

// PUT /api/blogs/:id
blogsRouter.put('/:id',async (request, response, next) => {
    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid'})
    }

    const blog = await Blog.findById(request.params.id)
    if (blog.author.toString() !== user._id.toString()) {
        return response.status(401).json({ error: 'unauthorized user!'})
    }

    if (Object.keys(request.body).length === 0) {
        return response.status(400).json({ error: 'no content to update!'})
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true })
    response.json(updatedBlog)

})


module.exports = blogsRouter