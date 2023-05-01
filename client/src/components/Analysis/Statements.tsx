import React from "react";
import uniqid from "uniqid";
import { Form, Col, Row } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

const Statements = ({ statements, setSelectedStatement, selectedStatement, setParameters, getStatement }) => {
  const onStatementChange = (selected) => {
    const selectedStatement = selected[0]?.statement;
    if (!selectedStatement) return;
    setSelectedStatement(selectedStatement);
    const statement = getStatement(selectedStatement);
    if (statement.parameters) {
      setParameters(statement.parameters);
    }
  };
  return (
    <Form.Group className="mb-3" as={Row}>
      <Col lg="8">
        <Form.Label>What do you want to know about?</Form.Label>
        <Typeahead
          loading={!statements ? true : false}
          inputProps={{ autoComplete: "false" }}
          id={uniqid()}
          labelKey="statement"
          multiple={false}
          onChange={onStatementChange}
          onSearch={() => {
            setParameters([]);
          }}
          options={statements}
          shouldSelect={(shouldSelect, e) => {
            // Select the hint if the user hits 'enter' or ','
            return e.keyCode === 13 || e.keyCode === 188 || shouldSelect;
          }}
          defaultSelected={selectedStatement ? [selectedStatement] : []}
          isDisabled={selectedStatement !== null}
          maxHeight="200px"
          placeholder="Search or select a statement..."
          filterBy={(option, props) =>
            props.text
              .toLowerCase()
              .split(" ")
              .every((text) => option.statement.toLowerCase().includes(text))
          }
          clearButton
        />
      </Col>
    </Form.Group>
  );
};

export default Statements;
