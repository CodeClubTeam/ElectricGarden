import React from "react";
import Button from "react-bootstrap/esm/Button";

type Props = {
  message?: string;
  retry?: () => void;
};

export const FetchError = ({ retry, message = "Error fetching" }: Props) => (
  <p>
    {message} {retry && <Button onClick={() => retry()}>Retry</Button>}
  </p>
);
