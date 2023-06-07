import React, { FunctionComponent } from "react";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import uniqid from "uniqid";
import { Form, Col, Row } from "react-bootstrap";

type Props = {
  parameters: any[];
  fetchAutocompleteSuggestions: (value: string, query) => Promise<string[]>;
  autoCompleteSuggestions: string[];
  setSelectedParameter: (parameter: any) => void;
  selectedParameter: string;
  loadingAutosuggestions: boolean;
};

const Parameters: FunctionComponent<Props> = ({ parameters, fetchAutocompleteSuggestions, autoCompleteSuggestions, setSelectedParameter, selectedParameter, loadingAutosuggestions }) => {
  return (
    <>
      {parameters &&
        parameters.map((parameter, index) => {
          return (
            <Form.Group key={index} className="mb-3">
              {parameter.type === "string" && (
                <Col lg="8">
                  {parameter?.prompt && <Form.Label>{parameter.prompt}</Form.Label>}
                  <AsyncTypeahead
                    as={Form.Control}
                    id={uniqid()}
                    isLoading={false}
                    labelKey={null}
                    minLength={3}
                    onChange
                    onSearch={(query) => fetchAutocompleteSuggestions(parameter.options.attribute, query)}
                    options={autoCompleteSuggestions?.map(String)}
                    placeholder="Search or select a statement..."
                    shouldSelect={(shouldSelect, e) => {
                      // Select the hint if the user hits 'enter' or ','
                      return e.keyCode === 13 || e.keyCode === 188 || shouldSelect;
                    }}
                    defaultInputValue={""}
                    loading={loadingAutosuggestions}
                  />
                </Col>
              )}
              {parameter.type === "boolean" && (
                <Form>
                  <Form.Check type="switch" title={parameter.prompt} name={parameter.options.attribute} label={parameter.prompt} />
                </Form>
              )}
              {parameter.type === "enum" && (
                <Form.Group as={Row}>
                  <Col lg="8">
                    <Form.Label>{parameter.prompt}</Form.Label>
                    <Form.Select value={selectedParameter} multiple={parameter.allowMultiple} onChange={(e) => setSelectedParameter(e.target.value)}>
                      {/* default value was "day-over-day" but year-over-year was displaying; simplest hack I could think of, sorry for ugliness! */}
                      {(parameter?.options?.length==6 ?
                        parameter?.options.slice(0,3).toReversed().concat(parameter?.options.slice(3)) :
                        parameter?.options)?.map((param, index) => (
                        <option key={index} value={param.value ? param.value : param}>
                          {param.label ? param.label : param}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Form.Group>
              )}
            </Form.Group>
          );
        })}
    </>
  );
};

export default Parameters;
