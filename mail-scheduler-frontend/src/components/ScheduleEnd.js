import React, { useContext } from 'react';
import FormContext from './FormContext';
import { ONCE } from './Recurrence';

const NEVER = 'never';
const END_ON_DATE = 'end_on_date';
const END_AFTER_X = 'end_after_x';

function RadioGroup({ name, children }) {
  const { state: { endType }, dispatch } = useContext(FormContext);
  const handler = e => dispatch(['endType', e.target.value]);
  return (
    <>
      {children.map(c =>
        <div>
          <label key={c.props.radioValue}>
            <input
              name={name}
              type="radio"
              onChange={handler}
              value={c.props.radioValue}
              checked={endType === c.props.radioValue}/>
            {c}
          </label>
        </div>
      )}
    </>
  );
}

export default function ScheduleEnd() {
  const { state: { recurrence, endDate, endAfter, endType }, dispatch } = useContext(FormContext);
  
  const endDateInput = <input
    type="date"
    value={endDate}
    disabled={endType !== END_ON_DATE}
    onChange={(e) => dispatch(['endDate', e.target.value])}
  />;

  const endAfterInput = <input
    min="1"
    type="number"
    value={endAfter}
    disabled={endType !== END_AFTER_X}
    onChange={(e) => dispatch(['endAfter', e.target.value])}
  />;

  return (recurrence === ONCE)
    ? null
    : (
      <div>
        <label>
          Ends
          <RadioGroup name="end">
            <span radioValue={NEVER}>never</span>
            <label radioValue={END_ON_DATE}>on {endDateInput}</label>
            <label radioValue={END_AFTER_X}>after {endAfterInput} e-mails</label>
          </RadioGroup>
        </label>
      </div>
  );
}

export const initialScheduleEnd = {
  endType: NEVER,
};