import React, { useContext } from 'react';
import FormContext from './FormContext';

export default function MailForm() {
  const { state: { from, to, subject, body }, dispatch } = useContext(FormContext);
  
  const update = field => e => dispatch([field, e.target.value]);

  return (
    <div>
      <label>
        Mail
          <div><label>From <input type="email" value={from} onChange={update('from')} /></label></div>
          <div><label>To <input type="email" value={to} onChange={update('to')} /></label></div>
          <div><label>Subject <input value={subject} onChange={update('subject')} /></label></div>
          <div><label>Mail body &nbsp;<textarea value={body} onChange={update('body')} /></label></div>
      </label>
    </div>
  );
}

export const initialMail = {
  from: '',
  to: '',
  subject: '',
  body: '',
};