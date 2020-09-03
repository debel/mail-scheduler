import React, { useContext } from 'react';
import FormContext from './FormContext';

export const ONCE = 'once';
export const DAILY = 'daily';
export const WEEKLY = 'weekly';
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const cloneWithChange = (arr, i, newValue) =>
  arr.map((v, j) => i === j ? newValue : v);

function DaysOfWeek() {
  const { state: { daysOfWeek, recurrence }, dispatch } = useContext(FormContext);
  
  return recurrence !== WEEKLY
    ? null
    : (
      <div>On &nbsp;
        {DAYS.map((day, i) =>
          <label key={day}><input
            type="checkbox"
            checked={daysOfWeek[i] ? "checked" : ""}
            onClick={e => {
              e.stopPropagation();
              const newSelection = cloneWithChange(daysOfWeek, i, !daysOfWeek[i]);
              dispatch(['daysOfWeek', newSelection]);
            }}
          />{day}</label>
        )}
      </div>
    );
}

function TimeOfDay() {
  const { state: { timeOfDay }, dispatch } = useContext(FormContext);

  return (
    <label>At &nbsp;
      <input
        type="time"
        value={timeOfDay}
        onChange={e => dispatch(['timeOfDay', e.target.value])} />
    </label>
  );
}

function OnceDate() {
  const { state: { onceDate, recurrence }, dispatch } = useContext(FormContext);

  return (recurrence !== ONCE)
    ? null
    : (
      <div>
        <label>On&nbsp;
          <input type="date" value={onceDate} onChange={e => dispatch(['onceDate', e.target.value])} />
        </label>
      </div>
    );
}

export default function Recurrence() {
  const { state: { recurrence }, dispatch } = useContext(FormContext);

  return (
    <div>
      <label>Repeats
        <div>
          <label>
            <select value={recurrence} onChange={e => dispatch(['recurrence', e.target.value])}>
              <option value={ONCE}>Once</option>
              <option value={DAILY}>Daily</option>
              <option value={WEEKLY}>Weekly</option>
            </select>
          </label>
        </div>
        <OnceDate />
        <DaysOfWeek />
        <TimeOfDay />
      </label>
    </div>
  );
}

export function calculateCron({ recurrence, daysOfWeek, timeOfDay }) {
  const day = recurrence === DAILY
    ? '*'
    : daysOfWeek.map((v, i) => v === true ? i +1 : -1).filter(v => v !== -1).join(',');
  
  const [hour, minutes] = timeOfDay.split(':');

  return `${minutes} ${hour} * * ${day}`
}

export const initialRecurrence = {
  recurrence: DAILY,
  daysOfWeek: new Array(7).fill(false),
  timeOfDay:'12:00',
};