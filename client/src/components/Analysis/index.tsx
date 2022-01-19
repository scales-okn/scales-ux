import React, { useState, useEffect, FunctionComponent } from 'react';
import { StatementManager } from "statement-mananger";
import { IPanel } from "../../store/panels";
import { IRing, IInfo } from "../../store/rings";
import { BsXOctagonFill } from "react-icons/bs";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import uniqid from "uniqid";
import { useNotify } from "../../components/Notifications";
import { Form, Button, Col, Row } from "react-bootstrap"

type AnalysisProps = {
  panel: IPanel;
  ring: IRing;
  info: IInfo;
}

const Analysis: FunctionComponent<AnalysisProps> = ({ ring, panel, info }) => {
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [statements, setStatements] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);
  const { notify } = useNotify();

  useEffect(() => {
    if (!info) return;
    const SM = new StatementManager(info.operations, info.analysisSpace, ring);
    setStatements(SM.generate());
  }, [info]);


  console.log(statements, info);

  const fetchAutocompleteSuggestions = async (type, query) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/autocomplete/${ring.rid}/1/${info?.defaultEntity}/${type}?query=${query}`
      );
      if (response.status === 200) {
        const data = await response.json();
        setAutoCompleteSuggestions(data);
        setIsLoading(false);
      } else {
        notify("Could not fetch autocomplete suggestions", "error");
      }
    } catch (error) {
      console.log(error);
      notify("Could not fetch autocomplete suggestions", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatement = (statement) => {
    return statements.find(s => s.statement === statement);
  }
  return (<>

    <Form.Group className="mb-3" as={Row}>
      <Col>
        <Form.Select value={selectedStatement}
          onChange={(e) => {
            setSelectedStatement(e.target.value);
            const statement = getStatement(e.target.value);
            if (statement.parameters) {
              setParameters(statement.parameters);
            }
            console.log(statement);

          }}
          disabled={selectedStatement !== null}>
          {statements.map((statement, index) => <option key={index} value={statement.statement}>{statement.statement}</option>)}
        </Form.Select>
      </Col>
      <Col>
        {selectedStatement && <Button variant="link" onClick={() => {
          setSelectedStatement(null);
          setParameters([]);
        }}><BsXOctagonFill /></Button>}
      </Col>
    </Form.Group>

    {parameters && parameters.map((parameter, index) => {
      return (<Form.Group key={index} className="mb-3">
        {parameter?.prompt && <Form.Label>{parameter.prompt}</Form.Label>}
        {parameter.type === "value" &&
          <AsyncTypeahead
            id={uniqid()}
            filterBy={() => true}
            isLoading={isLoading}
            labelKey={null}
            minLength={3}
            onSearch={(query) =>
              fetchAutocompleteSuggestions(parameter.options.attribute, query)
            }
            options={autoCompleteSuggestions.map(String)}
            placeholder="Type..."
            defaultInputValue={""}
          // onBlur={(event) =>
          //   setFilter({ ...filter, value: event.target.value })
          // }
          />
        }

      </Form.Group>)
    })
    }

    <Button type="submit" className="text-white">Remove</Button>

  </>);
}

export default Analysis;
