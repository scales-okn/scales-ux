import React, { ReactNode, createContext, useContext, useEffect } from "react";
import { fetchInfo, infoSelector } from "../../store/info";
import { useDispatch, useSelector } from "react-redux";
import appendQuery from "append-query";

import usePersistedState from "use-persisted-state-hook";
import Loader from "../Loader";

const NotebookContext = createContext(null);
export const useNotebookContext = () => useContext(NotebookContext);

type Props = {
  children: ReactNode;
};

export type FilterInput = {
  id: string;
  value: string | number;
  type: string;
};

type ResultsResponse = {
  activeCacheRange: Array<number>;
  batchSize: number;
  results: Array<any>;
  totalCount: number;
};

const NotebookContextProvider = ({ children }: Props) => {
  const dispatch = useDispatch();
  const { info, loadingInfo, hasErrors } = useSelector(infoSelector);
  const [filterInputs, setFilterInputs] = usePersistedState("filterInputs", []);
  const [results, setResults] = usePersistedState<ResultsResponse>();
  // @ts-ignore
  const { filters = [], columns = [] } = info;

  type FetchResultsParams = {
    page?: number;
    batchSize?: number;
    filterInputs?: Array<FilterInput>;
  };

  const fetchResults = async (filterInputs: [], page = 0, batchSize = 10) => {
    console.log({ filterInputs });
    // setIsLoading(true);
    try {
      const response = await fetch(
        appendQuery(
          `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/results/?page=${page}&batchSize=${batchSize}&sortBy=dateFiled&sortDirection=desc`,
          filterInputs?.reduce((acc, current) => {
            //@ts-ignore
            acc[current.type] = current.value;
            return acc;
          }, {})
        )
      );
      const data = await response.json();

      setResults(data);
    } catch (error) {
      // TODO: Implement Error handling
    }
  };

  const getFilterInputById = (id: string) =>
    filterInputs?.find((filterInput: FilterInput) => filterInput.id === id);

  const getFilterColumnByKey = (key: string) =>
    columns.find((column) => column.key == key);

  const getFilterOptionsByKey = (key) => {
    try {
      return filters.find((filter) => filter.includes(key))[1];
    } catch (error) {
      console.log(error);
    }
  };

  const setFilterInput = (filterInput: FilterInput) => {
    setFilterInputs((prevFilterInputs: Array<FilterInput>) => {
      return [
        ...prevFilterInputs.filter(
          (prevFilterInput: FilterInput) =>
            prevFilterInput.id !== filterInput.id
        ),
        { ...filterInput },
      ];
    });
  };

  const getFiltersNormalized = () => {
    try {
      return filters
        .map((filter) => ({ key: filter[0], ...filter[1] }))
        .sort((a, b) => a.key.localeCompare(b.key));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    dispatch(fetchInfo());
    fetchResults(filterInputs);
  }, [dispatch]);

  if (loading) return <Loader animation="border" isVisible={true} />;
  if (hasErrors) return <p>Cannot display filters...</p>;

  return (
    <NotebookContext.Provider
      value={{
        columns,
        filters,
        filterInputs,
        setFilterInputs,
        getFilterInputById,
        getFilterColumnByKey,
        getFilterOptionsByKey,
        getFiltersNormalized,
        setFilterInput,
        results,
        fetchResults,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
};

export default NotebookContextProvider;
