import React, { useContext } from 'react';
import FormContext from './FormContext';
import config from '../config';

function sendToServer(state) {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(state)
  };

  return fetch(config.serverUrl, options)
    .then(console.log, console.error);
}

export default function Submit() {
  const { state } = useContext(FormContext);

  return <button onClick={(e) => { e.preventDefault(); sendToServer(state); }}>Submit</button>
}