import React, { useEffect, FunctionComponent } from 'react';
import { usePanel } from 'store/panels';
import { Button } from "react-bootstrap";
import { StatementManager } from "statement-mananger";

type AnalysisProps = {
  panelId: string;
  ring: IRing;
  info: IRingInfo;
}



const Analysis: FunctionComponent<AnalysisProps> = ({ panelId, ring, info }) => {
  const { panel, analysis, addPanelAnalysis, removePanelAnalysis } = usePanel(panelId);
  console.log(StatementManager);

  useEffect(() => {
    if (!info) return;
    const SM = new StatementManager(info.targetEntities, info.operations, info.analysisSpace, ring);
    console.log(SM);
    // setStatements(SM.generate());
  }, [info]);


  return (
    <div>
      {
        analysis.map(({ id, statements }) => (
          <div key={id}>
            <div>
              {id}
              <Button
                onClick={() => {
                  removePanelAnalysis(id);
                }}
              >
                Remove</Button>
            </div>
            {
              statements.map(({ statement, parameters }) => (
                <div key={statement}>
                  {statement}
                  {
                    parameters.map(({ name, value }) => (
                      <div key={name}>
                        {name}
                        {value}
                      </div>
                    ))
                  }
                </div>
              ))
            }

          </div>
        ))
      }
    </div>
  )
}

export default Analysis;