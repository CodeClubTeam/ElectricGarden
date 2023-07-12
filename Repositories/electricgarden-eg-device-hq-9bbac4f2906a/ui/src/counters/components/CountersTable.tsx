import { sum } from "lodash-es";
import React from "react";
import Button from "react-bootstrap/esm/Button";
import styled from "styled-components/macro";

import { Loading } from "../../atomic-ui";
import { formatDateTime } from "../../shared";
import { getCountersCsvUrl, useFetchCounters } from "../countersApi";

type Props = {
  serial: string;
};

const Container = styled.div`
  overflow: scroll;
`;

const Table = styled.table`
  td,
  th {
    border-bottom: 1px dashed #828282;
  }
`;

const HeaderTh = styled.th`
  font-weight: bold;
`;

const ValueTd = styled.td`
  text-align: center;
  padding: 0.25em;
`;

const TotalTd = styled.td`
  text-align: center;
  font-weight: bold;
  background-color: #828282;
  vertical-align: bottom;
`;

const ButtonsContainer = styled.div`
  display: flex;
  max-width: 15em;
  padding-top: 2em;
  margin: 0 2em 0.5em auto;
`;

const DownloadLink = styled.a`
  white-space: nowrap;
  margin: 0 1em;
  line-height: 3em; /* middle hack*/
`;

export const CountersTable: React.FC<Props> = ({ serial }) => {
  const { status, data, refetch } = useFetchCounters(serial);

  if (!status || status === "loading") {
    return <Loading />;
  }

  if (status === "error") {
    return (
      <p>
        Error fetching counters.{" "}
        <Button onClick={() => refetch()}>Retry</Button>
      </p>
    );
  }

  if (!data) {
    return <p>Failed to load.</p>;
  }

  const { values: rows } = data;
  if (rows.length < 2) {
    return <p>No data</p>;
  }

  const headerColumns = rows[0];
  const valueRows = rows.slice(1);

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            {headerColumns.map((header, index) => (
              <HeaderTh key={index}>
                {index > 0 && typeof header === "string"
                  ? formatDateTime(header)
                  : header}
              </HeaderTh>
            ))}
            <HeaderTh>Total</HeaderTh>
          </tr>
        </thead>
        <tbody>
          {valueRows.map((row, index) => (
            <tr key={index}>
              <HeaderTh>{row[0]}</HeaderTh>
              {row.slice(1).map((value, index) => (
                <ValueTd key={index}>{value}</ValueTd>
              ))}
              <TotalTd>{sum(row.slice(1).map((v) => Number(v)))}</TotalTd>
            </tr>
          ))}
        </tbody>
      </Table>
      <ButtonsContainer>
        <Button onClick={() => refetch()}>Refresh</Button>
        <DownloadLink
          href={getCountersCsvUrl(serial)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download CSV
        </DownloadLink>
      </ButtonsContainer>
    </Container>
  );
};
