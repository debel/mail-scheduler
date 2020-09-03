import React, { useReducer, useMemo } from 'react';
import FormContext from './components/FormContext';
import MailForm from './components/MailForm';
import Recurrence, { initialRecurrence, calculateCron } from './components/Recurrence';
import ScheduleEnd, { initialScheduleEnd } from './components/ScheduleEnd';
import Submit from './components/Submit';

function formReducer(state, [action, payload]) {
  const newState = { ...state, [action]: payload };
  newState.cron = calculateCron(newState);
  return newState;
}

const initialState = {
  ...initialRecurrence,
  ...initialScheduleEnd,
};

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