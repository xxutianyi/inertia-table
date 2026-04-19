import type { FunctionComponent, ReactNode } from 'react';

export type PaginateLink = {
    url: string;
    page: string;
    label: string;
    active: boolean;
};

export type PaginateData<T = unknown> = {
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
    links: PaginateLink[];
};

export type Filter = {
    label: string;
    value: string;
    icon?: FunctionComponent<{ className?: string }>;
};

export type TableColumn<TData> = {
    index: string;
    title?: string;
    dataKey?: keyof TData | string[];
    hidden?: boolean;
    colSpan?: number;
    hideable?: boolean;
    filter?: Filter[];
    sortable?: boolean;
    titleRender?: () => ReactNode;
    tableRowRender?: (data: TData) => ReactNode;
};

export type DataTableProps<TData = any> = {
    rowKey?: keyof TData;
    columns: TableColumn<TData>[];
    paginateData: PaginateData<TData>;
    sizeOptions?: number[];
    showSearch?: boolean;
    showPageNumbers?: boolean;
    onRowSelection?: (keys?: string[]) => void;
    className?: string;
    toolbarAction?: ReactNode;
};

export type SimpleTableProps<TData = any> = {
    rowKey?: keyof TData;
    data?: TData[];
    columns: TableColumn<TData>[];
    sizeOptions?: number[];
    className?: string;
};
