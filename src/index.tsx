import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';

const browserSupported = (() => {
    return (typeof Promise !== 'undefined') && (typeof FontFace !== 'undefined');
})();

if (browserSupported) {
    ReactDOM.render(<App />, document.getElementById('root'));
} else {
    ReactDOM.render(<div style={{color:'white',textAlign:'center'}}>Sorry your browser is not supported.</div>, document.getElementById('root'));
}
