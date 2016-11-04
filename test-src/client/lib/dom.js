import React from 'react';

let ReactDOM;

try {
  ReactDOM = require('react-dom');
} catch (e) {
  ReactDOM = React;
}

export default ReactDOM;
