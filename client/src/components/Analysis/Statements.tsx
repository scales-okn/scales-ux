import React from "react";
import uniqid from "uniqid";
import { Form, Col, Row } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

const Statements = ({
  statements,
  setSelectedStatement,
  selectedStatement,
  setParameters,
  getStatement
}) => {
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
          onChange={(selected) => {
            const selectedStatement = selected[0]?.statement;
            if (!selectedStatement) return;
            setSelectedStatement(selectedStatement);
            const statement = getStatement(selectedStatement);
            if (statement.parameters) {
              setParameters(statement.parameters);
            }
          }}
          onSearch={() => {
            setParameters([]);
          }}
          options={statements}
          selectHintOnEnter={true}
          defaultSelected={selectedStatement ? [selectedStatement] : []}
          isDisabled={selectedStatement !== null}
          maxHeight="200px"
          placeholder="Search or select a statement..."
          filterBy={(option, props) =>
            props.text.toLowerCase().split(" ").every(x => option.statement.toLowerCase().includes(x))
          }
        />
      </Col>
    </Form.Group>
  );
}


export default Statements;