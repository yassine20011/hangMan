import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import firebase from './firebaseConfig.js';
import Header from './Header';
import Home from './Home';
import Game from './Game';
import Leaderboard from './Leaderboard';
import Footer from './Footer';
import './App.scss';

function App() {
  const [charArray, setCharArray] = useState([]);
  const [definition, setDefinition] = useState('');
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [userList, setUserList] = useState([]);

  // If game is not running, generate a new word and word hint(definition)
  useEffect(() => {
    // if game is not yet started or previous game has been stopped, fetch new data
    if (!isGameRunning) {
      // Get a random word from random-word-api
      const randomWordUrl = new URL(`https://random-word-api.herokuapp.com/word`);
      randomWordUrl.search = new URLSearchParams({
        swear: 1,
        number: 1,
      });
      const fetchData = (count) => {
        // Increment count
        count++;
        fetch(randomWordUrl)
          .then((res) => res.json())
          .then((data) => {
            // Set word to the charArray
            setCharArray(data[0].toUpperCase().split(''));
            // Get the definition of the word
            const apiKey = `27f927fa-fa4e-47c0-b6a8-a83eb72c66aa`;
            const definitionUrl = new URL(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${data[0]}`);
            definitionUrl.search = new URLSearchParams({
              key: apiKey,
            });
            fetch(definitionUrl)
              .then((res) => res.json())
              .then((data) => {
                // If there is no definition for the word
                if (data[0].shortdef === undefined) {
                  throw new Error('No Defintion found for word.');
                }
                // Get a random definition
                const randomIdx = Math.floor(Math.random() * data[0].shortdef.length);
                setDefinition(data[0].shortdef[randomIdx]);
              })
              .catch((error) => {
                setDefinition(`${error}`);
                // Try again with recursion if no definition is found.
                if (count <= 3) {
                  fetchData(count);
                }
              });
          });
      };
      fetchData(0);
    }
  }, [isGameRunning]);

  // Load the leaderboard database
  useEffect(() => {
    const dbRef = firebase.database().ref();
    dbRef.on('value', (snapshot) => {
      const myData = snapshot.val();

      const newArray = [];
      for (let dataKey in myData) {
        const userObject = {
          key: dataKey,
          username: myData[dataKey].username,
          score: myData[dataKey].score,
          word: myData[dataKey].word,
        };
        newArray.push(userObject);
      }
      // sort the object array by score
      newArray.sort((a, b) => a.score < b.score);
      setUserList(newArray);
    });
  }, []);

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Header />
      <main className='wrapper'>
        <Route exact path='/' component={Home} />
        <Route path='/game' render={() => <Game gameWordArray={charArray} setIsGameRunning={setIsGameRunning} definition={definition} />} />
        <Route path='/leaderboard' render={() => <Leaderboard userList={userList} />} />
      </main>

      <Footer />
    </Router>
  );
}

export default App;
