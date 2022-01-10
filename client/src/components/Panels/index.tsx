import React, { FunctionComponent, useEffect } from "react";
import { DataGrid } from "@material-ui/data-grid";

import Loader from "../Loader";
// import Dataset from "../Dataset";
import AddPanel from "./AddPanel";
import Panel from "./Panel";
import { panelsSelector, fetchPanels } from "../../store/panels";
import { useSelector, useDispatch } from "react-redux";


const Panels: FunctionComponent = () => {
  const { panels, loadingPanels } = useSelector(panelsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPanels());
  }, []);

  console.log(panels);

  return (
    <Loader animation="border" isVisible={loadingPanels}>
      <>
        {panels.length > 0 && panels.map((panel, index) => (
          <Panel key="index" panel={panel} />
        ))}
        <AddPanel />
      </>
    </Loader>

  );
};

export default Panels;
