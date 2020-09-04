import React, { useContext } from 'react';
import FormContext from './FormContext';

export const ONCE = 'once';
export const DAILY = 'daily';
export const WEEKLY = 'weekly';
export const MONTLY = 'montly';
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const cloneWithChange = (arr, i, newValue) =>
  arr.map((v, j) => i === j ? newValue : v);

function DayOfMonth() {
  const { state: { dayOfMonth, recurrence }, dispatch } = useContext(FormContext);
  return recurrence !== MONTLY
    ? null
    : (
      <div>
        <label>
          Every&nbsp;
          <input value={dayOfMonth} onChange={e => dispatch(['dayOfMonth', e.target.value])} />
        </label>
      </div>
    );
}

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

function CurrentTimeZone() {
  return <span>{new Date().toString().split(' ').splice(5).join(' ')}</span>;
}

function TimeOfDay() {
  const { state: { timeOfDay }, dispatch } = useContext(FormContext);

  return (
    <label>At &nbsp;
      <input
        type="time"
        value={timeOfDay}
        onChange={e => dispatch(['timeOfDay', e.target.value])} />
      <CurrentTimeZone />
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
              <option value={MONTLY}>Montly</option>
            </select>
          </label>
        </div>
        <OnceDate />
        <DaysOfWeek />
        <DayOfMonth />
        <TimeOfDay />
      </label>
    </div>
  );
}

function adjustTimeToUTC(timeOfDay) {
  const [hour, minutes] = timeOfDay.split(':');
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minutes);
  debugger;

  return [date.getUTCHours(), date.getUTCMinutes()];
}

export function calculateCron({ recurrence, daysOfWeek, dayOfMonth, timeOfDay }) {
  const weekDay = recurrence === WEEKLY
    ? daysOfWeek.map((v, i) => v === true ? i +1 : -1).filter(v => v !== -1).join(',')
    : '*';

  const monthDay = recurrence === MONTLY
    ? dayOfMonth
    : '*';
  
  const [hour, minutes] = adjustTimeToUTC(timeOfDay);

  return `${minutes} ${hour} ${monthDay} * ${weekDay}`
}

export const initialRecurrence = {
  recurrence: DAILY,
  daysOfWeek: new Array(7).fill(false),
  timeOfDay:'12:00',
};