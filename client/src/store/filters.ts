import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AutoComplete = {
    label: string;
    value: string;
};

export type Filter = {
    label: string;
    type: string;
    field: string;
    value: string;
    autoComplete?: AutoComplete[];
    subFilters?: Filter[];
};

export interface FiltersState {
    activeFilters: Record<string, Filter[]>;
    autocompleteOptions: Record<string, Record<string, AutoComplete[]>>;
    loadingStates: Record<string, Record<string, boolean>>;
}

const initialState: FiltersState = {
    activeFilters: {},
    autocompleteOptions: {},
    loadingStates: {},
};

export const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setFiltersForEntity: (
            state,
            action: PayloadAction<{ entity: string; filters: Filter[] }>
        ) => {
            const { entity, filters } = action.payload;
            state.activeFilters[entity] = filters;
        },
        clearFiltersForEntity: (state, action: PayloadAction<string>) => {
            const entity = action.payload;
            state.activeFilters[entity] = [];
        },
        setAutocompleteOptions: (
            state,
            action: PayloadAction<{ entity: string; field: string; options: AutoComplete[] }>
        ) => {
            const { entity, field, options } = action.payload;
            if (!state.autocompleteOptions[entity]) {
                state.autocompleteOptions[entity] = {};
            }
            state.autocompleteOptions[entity][field] = options;
        },
        setLoadingState: (
            state,
            action: PayloadAction<{ entity: string; field: string; isLoading: boolean }>
        ) => {
            const { entity, field, isLoading } = action.payload;
            if (!state.loadingStates[entity]) {
                state.loadingStates[entity] = {};
            }
            state.loadingStates[entity][field] = isLoading;
        },
    },
});

export const {
    setFiltersForEntity,
    clearFiltersForEntity,
    setAutocompleteOptions,
    setLoadingState,
} = filtersSlice.actions;

export default filtersSlice.reducer; 