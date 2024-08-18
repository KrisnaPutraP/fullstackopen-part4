const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (lodash.isEmpty(blogs)) return null; // Handle empty array case

    const favorite = lodash.maxBy(blogs, 'likes');

    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes
    };
}


const mostBlogs = (blogs) => {
    const authors = lodash.countBy(blogs, 'author')
    const author = Object.keys(authors).reduce((author, key) => authors[key] > authors[author] ? key : author, Object.keys(authors)[0])
    return { author, blogs: authors[author] }
}

const mostLikes = (blogs) => {
    const authors = lodash.groupBy(blogs, 'author')
    const author = Object.keys(authors).reduce((author, key) => authors[key].reduce((sum, blog) => sum + blog.likes, 0) > authors[author].reduce((sum, blog) => sum + blog.likes, 0) ? key : author, Object.keys(authors)[0])
    return { author, likes: authors[author].reduce((sum, blog) => sum + blog.likes, 0) }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}