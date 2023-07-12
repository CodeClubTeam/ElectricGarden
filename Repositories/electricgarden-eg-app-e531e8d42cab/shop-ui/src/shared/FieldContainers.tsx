import styled from 'styled-components/macro';

export const FieldContainer = styled.div`
  display: grid;
  grid-template-columns: 15em auto;
  margin-bottom: 1em;
  max-width: 50em;

  label {
    grid-column: 1;
    padding-right: 1em;
    white-space: nowrap;
  }

  input {
    grid-column: 2;
    width: 100%;
    max-width: 40em;
    background: #f7f7f7;
    border: 1px solid #bdbdbd;
    box-sizing: border-box;
    border-radius: 2px;
    line-height: 2.8em;
    padding: 0 2em;

    ::placeholder {
      text-transform: lowercase;
    }
    :disabled {
      color: #828282;
    }
  }

  .validation-error {
    grid-column: 2;
  }
`;

export const CheckboxFieldContainer = styled.div`
  display: grid;
  grid-template-columns: 15em auto;
  margin-bottom: 1em;

  label {
    grid-column: 2;
    padding: 0 0.5em;
    text-transform: lowercase;
  }

  input {
    grid-column: 2;
    background: #f7f7f7;
    border: 1px solid #bdbdbd;
    box-sizing: border-box;
    border-radius: 2px;
  }

  .validation-error {
    grid-column: 2;
  }
`;
