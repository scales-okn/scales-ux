import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchInfo, infoSelector } from "../../store/info";
import { useDispatch, useSelector } from "react-redux";
import appendQuery from "append-query";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import dayjs from "dayjs";

import usePersistedState from "use-persisted-state-hook";
import Loader from "../Loader";

const NotebookContext = createContext(null);
export const useNotebookContext = () => useContext(NotebookContext);

type Props = {
  notebookId?: string | null;
  children: ReactNode;
  rings: Array<any>;
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

const NotebookContextProvider = ({ rings, notebookId, children }: Props) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [notebook, setNotebook] = useState(null);
  const [notebookTitle, setNotebookTitle] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const { info, loadingInfo, hasErrors } = useSelector(infoSelector);
  const [filterInputs, setFilterInputs] = usePersistedState(
    `filterInputs-${notebookId}`,
    []
  );
  const [loadingNotebook, setLoadingNotebook] = useState(false);
  const [savingNotebook, setSavingNotebook] = useState(false);
  const [results, setResults] = useState<ResultsResponse>();
  const { filters = [], columns = [], defaultEntity } = info;
  const authHeader = useAuthHeader();
  const [panels, setPanels] = useState([]);

  type FetchResultsParams = {
    page?: number;
    batchSize?: number;
    filterInputs?: Array<FilterInput>;
  };

  const fetchResults = async (
    ring,
    filterInputs: [],
    page = 0,
    batchSize = 10
  ) => {
    setLoadingResults(true);
    try {
      const response = await fetch(
        appendQuery(
          `${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/results/${ring.id}/${defaultEntity}?page=${page}&batchSize=${batchSize}&sortBy=dateFiled&sortDirection=desc`,
          filterInputs?.reduce((acc, filterInput: FilterInput) => {
            acc[filterInput.type] =
              filterInput.type === "dateFiled"
                ? //@ts-ignore
                  //   filterInput.value?.map((date) =>
                  //   dayjs(date).format("YYYY-MM-DD")
                  // )
                  //@ts-ignore
                  `[${filterInput.value?.map((date) =>
                    dayjs(date).format("YYYY-M-DD")
                  )}]`
                : filterInput.value;

            return acc;
          }, {}),
          { encodeComponents: false }
        )
      );
      const data = await response.json();

      setResults(data);
      setLoadingResults(false);
    } catch (error) {
      console.log(error);
    }
  };

  const saveNotebook = async () => {
    setSavingNotebook(true);
    const isNewNotebook = !notebookId;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks/${
          isNewNotebook ? "" : notebookId
        }`,
        {
          method: isNewNotebook ? "POST" : "PUT",
          headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: notebookTitle ? notebookTitle : " ",
          }),
        }
      );
      const { data } = await response.json();
      const { notebook } = data;

      setSavingNotebook(false);
      setNotebook(notebook);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotebook = async (id) => {
    setLoadingNotebook(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_API_ENDPOINT_URL}/notebooks/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
          },
        }
      );
      const { data } = await response.json();
      const { notebook } = data;

      setLoadingNotebook(false);

      setNotebook(notebook);
      setNotebookTitle(notebook.title);
      // if (notebook?.contents) {
      //   const notebookContents = JSON.parse(notebook.contents);
      //   notebookContents?.filterInputs &&
      //     setFilterInputs(notebookContents.filterInputs);
      //   notebookContents?.results && setResults(notebookContents.results);
      // }
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterInputById = (id: string) => {
    try {
      return filterInputs?.find(
        (filterInput: FilterInput) => filterInput.id === id
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterColumnByKey = (key: string) => {
    try {
      return columns.find((column) => column.key == key);
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterOptionsByKey = (key) => {
    try {
      return filters.find((filter) => filter.includes(key))[1];
    } catch (error) {
      console.log(error);
    }
  };

  const setFilterInput = (filterInput: FilterInput) => {
    try {
      setFilterInputs((prevFilterInputs: Array<FilterInput>) => {
        return [
          ...prevFilterInputs.filter(
            (prevFilterInput: FilterInput) =>
              prevFilterInput.id !== filterInput.id
          ),
          { ...filterInput },
        ];
      });
    } catch (error) {
      console.log(error);
    }
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
    if (!notebookId) {
      saveNotebook();
    } else {
      fetchNotebook(notebookId);
    }
    // dispatch(fetchInfo(ring.id));
    // fetchNotebook(notebookId);
    // fetchResults(ring, filterInputs);
  }, [rings, defaultEntity, notebookId]);

  if (loadingInfo) return <Loader animation="border" isVisible={true} />;
  if (hasErrors) return <p>Cannot display filters...</p>;

  return (
    <NotebookContext.Provider
      value={{
        rings,
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
        loadingResults,
        notebook,
        notebookTitle,
        setNotebookTitle,
        saveNotebook,
        savingNotebook,
        panels,
        setPanels,
        defaultEntity,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
};

export default NotebookContextProvider;
