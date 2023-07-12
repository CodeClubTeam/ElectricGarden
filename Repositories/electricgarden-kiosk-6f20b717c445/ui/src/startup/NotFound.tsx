import React from "react";

type Props = {
  idOrSerial: string | number;
};
export const NotFound = ({ idOrSerial }: Props) => (
  <div>
    <p>No sensor found with id or serial: {idOrSerial}.</p>
  </div>
);
