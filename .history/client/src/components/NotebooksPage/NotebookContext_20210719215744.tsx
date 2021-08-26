// @ts-nocheck
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchFilters, filtersSelector } from "../../store/filters";
import { useDispatch, useSelector } from "react-redux";

import usePersistedState from "use-persisted-state-hook";

const NotebookContext = createContext();
export const useNotebookContext = () => useContext(NotebookContext);

type Props = {
  // notebook?: object;
  children: ReactNode;
};

type FilterInput = {
  id: string;
  value: string | number;
  type: string;
};

const NotebookContextProvider = ({ children }: Props) => {
  const dispatch = useDispatch();
  const { filters, loading, hasErrors } = useSelector(filtersSelector);
  const [filterInputs, setFilterInputs] = usePersistedState<Array<FilterInput>>("filterInputs", []);
  console.log(filterInputs);
  

  const getFilterInputById = (id) =>
    filterInputs?.find((filterInput) => filterInput.id === id);

  const getFilterColumnByKey = (key) =>
    filters?.columns?.find((column) => column.key == key);

  const getFilterOptionsByKey = (key) => {
    try {
      return filters?.filters?.find((filter) => filter.includes(key))[1];
    } catch (error) {
      console.log(error);
    }
  };

  const getFiltersNormalized = () => {
    try {
      return filters?.filters?.map((filter) => ({ key: filter[0], ...filter[1] }))
        .sort((a, b) => a.key.localeCompare(b.key));
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //     fetch()
  // }, [filterInputs]);

  useEffect(() => {
    dispatch(fetchFilters());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (hasErrors) return <p>Cannot display filters...</p>;

  return (
    <NotebookContext.Provider
      value={{
        filters,
        filterInputs,
        setFilterInputs,
        getFilterInputById,
        getFilterColumnByKey,
        getFilterOptionsByKey,
        getFiltersNormalized,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
};

export default NotebookContextProvider;
