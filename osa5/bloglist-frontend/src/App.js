import React from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import blogService from './services/blogs'
import loginService from './services/login'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      blogs: [],
      username: '',
      password: '',
      user: null,
    }
  }

  componentDidMount() {
    blogService.getAll().then(blogs =>
      this.setState({ blogs })
    )
  } 

  handleLogin = async (event) => {
    event.preventDefault()
    console.log('login in with', this.state.username, this.state.password)

    event.preventDefault()
    try {
      const user = await loginService.login({
        username: this.state.username,
        password: this.state.password
      })
      
      blogService.setToken(user.token)

      this.setState({ username: '', password: '', user})
    } catch(exception) {
      this.setState({
        error: 'Invalid username or password',
      })
      setTimeout(() => {
        this.setState({ error: null })
      }, 5000)
    }

  }

  handleLoginFieldChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  loginForm = () => (
    <div>
      <h2>Login</h2>
      <LoginForm handleLogin={this.handleLogin} 
        handleUsernameChange={this.handleLoginFieldChange}
        handlePasswordChange={this.handleLoginFieldChange}
        username={this.state.username}
        password={this.state.password}
      />
    </div>
  )

  blogList = () => (
    <div>
      <h2>blogs</h2>
      {this.state.blogs.map(blog => 
        <Blog key={blog._id} blog={blog}/>
      )}
    </div>
  )

  render() {

    return (
      <div>

        {this.state.user === null ?
          this.loginForm() :
          <div>
            <p>{this.state.user.name} logged in</p>
            {this.blogList()}
          </div>
        }

      </div>
    );
  }
}

export default App;