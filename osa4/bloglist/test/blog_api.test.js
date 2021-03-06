const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const testHelper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')


beforeAll(async () => {

	await Blog.remove({}) // empty the DB

	const blogs = testHelper.initialBlogs.map(blog => new Blog(blog))
	const promiseArray = blogs.map(blog => blog.save()) // all promises in one
	await Promise.all(promiseArray)
})

describe('Only two users in db', async () => {
	
	beforeAll(async () => {
		await User.remove({})
		const users = testHelper.initialUsers.map(user => new User(user))
		const promiseArray = users.map(user => user.save())
		promiseArray.push()

		await Promise.all(promiseArray)

	})
	
	test('POST /api/users succeeds with a fresh username', async () => {
		const usersBeforeOperation = await testHelper.usersInDb()

		const newUser = {
			username: 'testuser',
			name: 'The very test User',
			password: 'supersecret'
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAfterOperation = await testHelper.usersInDb()
		expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
		const usernames = usersAfterOperation.map(u => u.username)
		expect(usernames).toContain(newUser.username)
	})

	test('POST /api/users will not succeed with a duplicate username', async () => {
		const usersBeforeOperation = await testHelper.usersInDb()

		const newUser = {
			username: 'root',
			password: 'sekret'
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		const usersAfterOperation = await testHelper.usersInDb()
		expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
	})

	test('POST /api/users will not succeed with short password', async () => {
		const usersBeforeOperation = await testHelper.usersInDb()

		const newUser = {
			username: 'shortpassworduser',
			password: 'se'
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		const usersAfterOperation = await testHelper.usersInDb()
		expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
	})


})

describe('get blogs', () => {

	test('Blog posts are fetched. Correct amount and content type.', async () => {

		const initialBlogs = await testHelper.blogsInDb()

		const response = await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)

		expect(response.body.length).toBe(initialBlogs.length)

	})

})

describe('create blogs', () => {

	test('Creating a new blog post', async () => {

		const initialBlogs = await testHelper.blogsInDb()

		await api
			.post('/api/blogs')
			.send({ title: 'Subject', author: 'BlogTester', url: 'http://localhost', likes: 7 })
			.expect(201)
			.expect('Content-Type', /application\/json/)
           
		const currentBlogs = await testHelper.blogsInDb()

		expect(currentBlogs.length).toBe(initialBlogs.length + 1)

		const author = currentBlogs.pop().author

		expect(author).toBe('BlogTester')

	})

	test('Creating a new blog post with no likes', async () => {

		const initialBlogs = await testHelper.blogsInDb()

		await api
			.post('/api/blogs')
			.send({ title: 'Subject', author: 'BlogTester', url: 'http://localhost' })
			.expect(201)
			.expect('Content-Type', /application\/json/)
            
		const currentBlogs = await testHelper.blogsInDb()

		expect(currentBlogs.length).toBe(initialBlogs.length + 1)

		const latestBlog = currentBlogs.pop()

		expect(latestBlog.likes).toBe(0)

	})

	test('Creating a new blog without title and url', async () => {
		const initialBlogs = await testHelper.blogsInDb()

		await api
			.post('/api/blogs')
			.send({ author: 'BlogTester', likes: 10 })
			.expect(400)

		const currentBlogs = await testHelper.blogsInDb()

		expect(currentBlogs.length).toBe(initialBlogs.length)
        
	})

})

describe('delete blogs', () => {

	test('Deleting a blog post with valid ID', async () => {

		const initialBlogs = await testHelper.blogsInDb()

		const deleteBlog = initialBlogs[Math.floor(initialBlogs.length / 2)] // pick a blog from middle

		await api
			.delete(`/api/blogs/${deleteBlog._id}`)
			.expect(204)

		const currentBlogs = await testHelper.blogsInDb()

		expect(currentBlogs.length).toBe(initialBlogs.length - 1)
        
	})

	test('Deleting a blog post with invalid ID', async () => {

		const falsifiedId = await testHelper.nonExistingId()
		const initialBlogs = await testHelper.blogsInDb()

		await api
			.delete(`/api/blogs/${falsifiedId}`)
			.expect(404)

		const currentBlogs = await testHelper.blogsInDb()

		expect(currentBlogs.length).toBe(initialBlogs.length)
        
	})

})

describe('modify blogs', () => {

	test('Modifying blog author and likes', async () => {

		const initialBlogs = await testHelper.blogsInDb()

		const originalBlog = initialBlogs[Math.floor(initialBlogs.length / 2)] // pick a blog from middle

		const modifiedBlog = {
			title: originalBlog.title,
			author: 'modified author',
			url: originalBlog.url,
			likes: originalBlog.likes + 666
		}

		await api
			.put(`/api/blogs/${originalBlog._id}`)
			.send(modifiedBlog)
			.expect(204)

		const currentBlogs = await testHelper.blogsInDb()

		const comparedBlog = currentBlogs[Math.floor(initialBlogs.length / 2)]

		expect(currentBlogs.length).toBe(initialBlogs.length)
		expect(comparedBlog.title).toBe(originalBlog.title)
		expect(comparedBlog.author).toBe('modified author')
		expect(comparedBlog.url).toBe(originalBlog.url)
		expect(comparedBlog.likes).toBe(originalBlog.likes + 666)
        
	})

})

afterAll(() => {
	server.close()
})