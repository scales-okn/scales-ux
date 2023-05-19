import styled from "styled-components";
import { Button } from "react-bootstrap";

export const Section = styled.div`
  padding: 8px 16px 16px 16px;
  position: relative;
`;

export const NotebookFilters = styled.div`
  padding: 16px 0;
  display: flex;
  align-items: center;
`;

export const AddButton = styled(Button)`
  border-radius: 4px;
  outline: 1px solid black;
  height: 36px;
  width: 36px;
`;

export const RenderedFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  max-width: calc(100% - 160px);
`;

export const FilterContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const AndLineContainer = styled.div`
  margin-left: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: grey;
`;

export const OrText = styled.div`
  margin: 0 8px;
  color: grey;
`;

export const AndLine = styled.div`
  height: 1px;
  width: 20%;
  margin: 0 20px;
  background: lightgrey;
`;

export const UpdateButtonContainer = styled.div`
  position: absolute;
  right: 16px;
  top: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
