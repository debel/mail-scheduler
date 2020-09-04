import React, { useReducer, useMemo } from 'react';
import FormContext from './components/FormContext';
import MailForm, { initialMail } from './components/MailForm';
import Recurrence, { initialRecurrence, calculateCron } from './components/Recurrence';
import ScheduleEnd, { initialScheduleEnd } from './components/ScheduleEnd';
import Submit from './components/Submit';

const initialState = {
  ...initialMail,
  ...initialRecurrence,
  ...initialScheduleEnd,
};

function formReducer(state, [action, payload]) {
  if (action === 'reset') {
    return initialState;
  }

  const newState = { ...state, [action]: payload };
  newState.cron = calculateCron(newState);
  return newState;
}

function ScheduleForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const memoState = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <FormContext.Provider value={memoState}>
      <MailForm />
      <Recurrence />
      <ScheduleEnd />
      <Submit />
    </FormContext.Provider>
  );
}

export default ScheduleForm;