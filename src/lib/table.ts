import _ from 'lodash';
import type { FunctionComponent, ReactNode } from 'react';

export type TableData = Record<string, any>;
export type IconType = FunctionComponent<{ className?: string }>;

export type Page = number;
export type Size = string;
export type Search = string | '';
export type SortState = 'asc' | 'desc' | undefined;
export type SelectState = boolean | 'indeterminate';
export type FilterState = string | undefined | null;
export type FilterOption = { label: string; value: string; icon?: IconType } | undefined;
export type ColumnIndex = string;

export type PaginateData<T extends TableData> = {
    data: T[];
    per_page: number;
    current_page: number;
    to: number;
    from: number;
    total: number;
    path: string;
    last_page: number;
    last_page_url: string;
    first_page_url: string;
    next_page_url?: string;
    prev_page_url?: string;
};

export type ColumnDef<TData extends TableData> = Partial<TableColumn<TData>>;

export type TableColumn<TData extends TableData> = {
    index: string;
    title?: string;
    dataKey?: keyof TData | (keyof TData)[];
    hidden?: boolean;
    colSpan?: number;
    filters?: FilterOption[];
    hideable?: boolean;
    sortable?: boolean;
    searchable?: boolean;
    titleRender?: () => ReactNode;
    tableRowRender?: (data: TData) => ReactNode;
};

export interface TableApi<TData extends TableData> {
    getData: () => TData[];
    getPage: () => Page;
    getSize: () => Size;
    getPageRows: () => number;
    getTotalPage: () => number;
    getColumns: () => TableColumn<TData>[];
    getHideableColumns: () => TableColumn<TData>[];
    getSelectedRows: () => string[];
    getRowSelectedState: (dataItem: TData) => SelectState;
    getRowSelectedAllState: () => SelectState;

    setNewPage: (page: Page) => void;
    setNewSize: (size: Size) => void;
    setColumnVisibleState: (column: ColumnIndex, state: boolean) => void;
    setRowSelectedState: (dataItem: TData, select: SelectState) => void;
    setRowSelectedAllState: (select: SelectState) => void;

    shouldAddSelectColumn: () => boolean;
}

export interface RouterTableApi<TData extends TableData> extends TableApi<TData> {
    getSearch: () => Search;
    getFilterableColumns: () => TableColumn<TData>[];
    getColumnSortState: (column: ColumnIndex) => SortState;
    getFilteredState: (column: ColumnIndex) => FilterState;
    getFilteredStateOption: (column: TableColumn<TData>) => FilterOption;

    setNewSearch: (search: Search) => void;
    setSortState: (column: ColumnIndex, sort: SortState) => void;
    setFilterState: (column: ColumnIndex, filter: FilterState) => void;
}

export function ColumnsDef<TData extends TableData = TableData>(columns: ColumnDef<TData>[]) {
    function columnKey(column: ColumnDef<TData>) {
        if (_.isArray(column.dataKey)) return column.dataKey.join('.');
        return (column.dataKey as string) ?? column.index;
    }
    return columns.map((column) => ({ ...column, index: columnKey(column) }));
}
