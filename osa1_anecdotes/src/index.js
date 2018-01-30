import React from 'react'
import ReactDOM from 'react-dom'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: 0
    }
  }

  randomizeAnecdote = () => {
    this.setState((prevState) => ({
        selected: Math.floor(Math.random()*this.props.anecdotes.length)
    }));
  }


    render() {
        return (
            <div>
                <div>{this.props.anecdotes[this.state.selected]}</div>
                <div>
                    <RandomizeButton handleClick={this.randomizeAnecdote} />
                </div>
            </div>
        )
    }
}

const anecdotes = [
  'If it hurts, do it more often',
  'Adding manpower to a late software project makes it later!',
  'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
  'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
  'Premature optimization is the root of all evil.',
  'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.'
]

const RandomizeButton = ({handleClick}) => {
    return (
        <button onClick={handleClick}>
            Next anecdote
        </button>
    )
}

ReactDOM.render(
  <App anecdotes={anecdotes} />,
  document.getElementById('root')
)