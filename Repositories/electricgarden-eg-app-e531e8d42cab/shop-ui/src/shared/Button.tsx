import { useFormikContext } from 'formik';
import React from 'react';
import Spinner from 'react-svg-spinner';
import styled, { css } from 'styled-components/macro';

const buttonCss = css`
  text-transform: lowercase;
  font-size: 1.2rem;
  border-radius: 10px;
  padding: 0.5em 2em;
  :hover {
    opacity: 0.5;
  }
`;

const StyledButton = styled.button`
  ${buttonCss}
  border: none;

  :disabled {
    background: #bdbdbd;
    opacity: initial;
  }
`;

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props,
) => <StyledButton type="button" {...props} />;

export const PrimaryButton = styled(Button)`
  background: #ec008c;
  color: white;
`;

export const SecondaryButton = styled(Button)`
  background: #e5e5e5;
`;

export const SubmitButton: React.FC<React.ButtonHTMLAttributes<
  HTMLButtonElement
>> = (props) => {
  const { isValid, isSubmitting } = useFormikContext();
  return (
    <PrimaryButton {...props} type="submit" disabled={!isValid || isSubmitting}>
      {isSubmitting && (
        <>
          <Spinner />{' '}
        </>
      )}
      {props.children}
    </PrimaryButton>
  );
};

export const LinkButton = styled.a`
  ${buttonCss}
  background: #ec008c;
  color: white;
  text-decoration: none;
`;
