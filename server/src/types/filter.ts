
export interface AutoComplete {
    label: string;
    value: string;
}

export interface Filter {
    label: string;
    type: string;
    field: string;
    value?: string;
    subFilters: Filter[];
    autoComplete: AutoComplete[];
}