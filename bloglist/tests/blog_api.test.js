const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const listHelper = require('../utils/list_helper')

const app = require('../app')
const Blog = require('../models/blog')
const { before } = require('lodash')
const { title } = require('node:process')
const api = supertest(app)



beforeEach(async () => {
  await Blog.deleteMany({})
  
  await Blog.insertMany(helper.blogs)
})


describe('HTTP GET request tests', () => {
  test('blogs are returned as json', async () => {
  console.log('entered test')
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })


  test('there are 6 blogs', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.blogs.length)
  })
  
  test('the first blog is about React patterns', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(e => e.title)
    assert(titles.includes('React patterns'))
  })

  test('id is defined for all blogs', async () => {
    const response = await api.get('/api/blogs')
    
    response.body.forEach(blog => {
      assert(blog.id)
      assert(!blog._id)
    })
  })
})

describe('HTTP POST request tests', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Test author',
      url: 'Test url',
      likes: 999
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
      
    // Make sure the new blog is added to the database
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.blogs.length + 1)
    const titles = blogsAtEnd.map(r => r.title)
    assert(titles.includes('async/await simplifies making async calls'))
  })

  test('blog without likes is added with 0 likes', async () => {
    const newBlog = {
      title: 'Test title',
      author: 'Test author',
      url: 'Test url'
    }
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    const addedBlog = blogsAtEnd.find(blog => blog.title === 'Test title')
    assert.strictEqual(addedBlog.likes, 0)
  })

  test('blog without title or url is not added', async () => {
    // Missing title
    const newBlog = {
      title: '',
      author: 'Test author',
      url: 'Test url',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.blogs.length)

    // Missing url
    newBlog.title = 'Test title'
    newBlog.url = ''

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    const blogsAtEnd_ = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd_.length, helper.blogs.length)
  })
})

describe('HTTP DELETE request tests', () => {
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
    const blogsAtEnd = await helper.blogsInDb()
  
    assert.strictEqual(blogsAtEnd.length, helper.blogs.length - 1)
    const titles = blogsAtEnd.map(r => r.title)
  
    assert(!titles.includes(blogToDelete.title))
  })
})

describe('HTTP PUT request tests', () => {
  test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = {
      title: 'Updated title',
      author: 'Updated author',
      url: 'Updated url',
      likes: 999
    }
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlogInDb = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
    assert.deepStrictEqual(updatedBlogInDb, { ...blogToUpdate, ...updatedBlog })
  })
})

after(async () => {
  await mongoose.connection.close()
})

// test('a specific blog can be viewed', async () => {
//   const blogsAtStart = await helper.blogsInDb()

//   const blogToView = blogsAtStart[0]

//   const resultBlog = await api
//     .get(`/api/blogs/${blogToView.id}`)
//     .expect(200)
//     .expect('Content-Type', /application\/json/)
//   const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

//   assert.deepStrictEqual(resultBlog.body, processedBlogToView)
// })

// test('a blog can be deleted', async () => {
//   const blogsAtStart = await helper.blogsInDb()
//   const blogToDelete = blogsAtStart[0]

//   await api
//     .delete(`/api/blogs/${blogToDelete.id}`)
//     .expect(204)
//   const blogsAtEnd = await helper.blogsInDb()

//   assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
//   const titles = blogsAtEnd.map(r => r.title)

//   assert(!titles.includes(blogToDelete.title))
// })

// after(async () => {
//   await mongoose.connection.close()
// })


