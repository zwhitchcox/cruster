import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './bg.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from 'react-router-dom';

const Bubbles = () => (
  <div className="bg-bubbles-container">
    <ul className="bg-bubbles">
      {[...new Array(20)].map((_, i) => {
        const animationDelay = (Math.random() * 30) + 's'
        const left = (Math.random() * 100) + '%'
        const widthNum = (Math.random() * 200)
        const height = widthNum + 'px'
        const width = widthNum + 'px'
        const borderRadius = (Math.random() > .5 ? 0 : widthNum / 2) + 'px'
        const animationDuration = (40 + Math.random() * 40) + 's'

        return (
          <li key={i} style={{animationDelay, left, width, borderRadius, height, animationDuration}} />
        )
      })}
    </ul>
  </div>
)
const rootElement = document.getElementById("root");


const Main = () => (
  <React.StrictMode>
    <Router>
      <>
      <Bubbles />
      <div className="App">
        <App />
      </div>
      </>

    </Router>
  </React.StrictMode>
)
if ((rootElement as any).hasChildNodes()) {
  ReactDOM.hydrate(<Main />, rootElement);
} else {
  ReactDOM.render(<Main />, rootElement);
}


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
