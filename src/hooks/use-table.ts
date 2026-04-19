import { router } from '@inertiajs/react';
import qs, { type ParsedQs } from 'qs';
import { useState } from 'react';
import type { PaginateData, TableColumn } from '../typings';

export type DataTableHookProps<TData> = {
    rowKey: keyof TData;
    columns: TableColumn<TData>[];
    paginateData: PaginateData<TData>;
    onRowSelection?: (keys: string[]) => void;
};

export function useDataTable<TData>({
    rowKey,
    columns,
    paginateData,
    onRowSelection,
}: DataTableHookProps<TData>) {
    const query = qs.parse(window.location.search.substring(1));

    const [sorts, setSorts] = useState<string>(query?.['sorts'] as string);
    const [search, setSearch] = useState<string>(query?.['search'] as string);
    const [filters, setFilters] = useState<{ index: string; value?: string }[]>(
        queryToFilter(query),
    );

    const [tableColumns, setTableColumns] = useState(columns);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    function onSelectedRowChange(newSelected: string[]) {
        setSelectedRows(newSelected);
        onRowSelection?.(newSelected);
    }

    function getColumns() {
        return tableColumns.filter((column) => !column.hidden);
    }

    function getHideableColumns() {
        return tableColumns.filter((column) => column.hideable || (column.title && column.dataKey));
    }

    function setColumnVisible(index: TableColumn<unknown>['index'], visible: boolean) {
        setTableColumns(
            tableColumns.map((column) => {
                if (column.index === index) column.hidden = !visible;
                return column;
            }),
        );
    }

    function getRowKey(dataItem: TData) {
        return dataItem[rowKey] as string;
    }

    function setRowSelected(dataItem: TData, selected: boolean | 'indeterminate') {
        onSelectedRowChange(
            selected
                ? [...selectedRows, getRowKey(dataItem)]
                : selectedRows.filter((row) => row !== getRowKey(dataItem)),
        );
    }

    function getRowSelected(dataItem: TData) {
        return !!selectedRows.find((row) => row === getRowKey(dataItem));
    }

    function setSelectedAll(selected: boolean | 'indeterminate') {
        onSelectedRowChange(selected ? paginateData.data.map(getRowKey) : []);
    }

    function getSelectedAll() {
        if (selectedRows.length === 0) return false;
        if (selectedRows.length === paginateData.data.length) return true;
        return 'indeterminate';
    }

    function getSelectedRows() {
        return selectedRows;
    }

    function getPageSize() {
        return `${paginateData.per_page}`;
    }

    function getPageRows() {
        return paginateData.to - paginateData.from + 1;
    }

    function getTotalPage() {
        return paginateData.last_page;
    }

    function getCurrentPage() {
        return paginateData.current_page;
    }

    function getPaginateLinks() {
        return {
            first: {
                action: () => router.get(paginateData.first_page_url),
                disabled: paginateData.current_page === 1,
            },
            prev: {
                action: () => router.get(paginateData.prev_page_url ?? ''),
                disabled: !paginateData.prev_page_url,
            },
            next: {
                action: () => router.get(paginateData.next_page_url ?? ''),
                disabled: !paginateData.next_page_url,
            },
            last: {
                action: () => router.get(paginateData.last_page_url),
                disabled: paginateData.current_page === paginateData.last_page,
            },
        };
    }

    function getPaginateFullLinks() {
        return paginateData.links;
    }

    function getSearch() {
        return search ?? '';
    }

    function onSearchChange(search?: string) {
        setSearch(search ?? '');
        router.get(paginateData.path, { search }, { preserveState: true });
    }

    function sortsToString(sortMetas?: { column: string; direction?: string }[]) {
        return sortMetas?.map((s) => `${s.column}:${s.direction}`).join(',');
    }

    function stringToSorts(string?: string) {
        if (!string) return [];
        return string
            .split(',')
            .map((sort) => {
                const sortMeta = sort.split(':');

                return sortMeta.length === 2
                    ? {
                          column: sortMeta?.[0] ?? '',
                          direction: sortMeta?.[1]?.toLowerCase() === 'asc' ? 'asc' : 'desc',
                      }
                    : undefined;
            })
            .filter((sort) => !!sort);
    }

    function getSorts() {
        return stringToSorts(sorts);
    }

    function getSortableDirection(column: TableColumn<any>) {
        return getSorts()?.find((sort) => sort.column === column.index)?.direction;
    }

    function onSortsChange(sort: { column: string; direction?: string }) {
        const sorts = sortsToString(
            sort.direction
                ? [...getSorts().filter((s) => s.column !== sort.column), sort]
                : getSorts().filter((s) => s.column !== sort.column),
        );

        setSorts(sorts ?? '');
        router.get(paginateData.path, { sorts }, { preserveState: true });
    }

    function queryToFilter(queryString: ParsedQs) {
        const columns = getFilterableColumns().map((c) => c.index);
        return Object.keys(queryString)
            .filter((key) => columns.includes(key))
            .map((key) => ({
                index: key as string,
                value: queryString?.[key] as string | undefined,
            }));
    }

    function filterToQuery(filters: { index: string; value?: string }[]) {
        return filters.reduce<Record<string, any>>((query, item) => {
            query[item.index] = item.value;
            return query;
        }, {});
    }

    function getFilters() {
        return filters;
    }

    function getFilteredItem(column: TableColumn<any>) {
        return column.filter?.find((filter) => filter.value == getFilteredValue(column));
    }

    function getFilteredValue(column: TableColumn<any>) {
        return getFilters()?.find((filter) => filter.index == column.index)?.value;
    }

    function getFilterableColumns() {
        return columns.filter(
            (column) => column.title && column.filter && column.filter.length > 0,
        );
    }

    function onFilterChange(filter: { index: string; value?: string }) {
        const filters = filter.value
            ? [...getFilters().filter((f) => f.index != filter.index), filter]
            : getFilters().filter((f) => f.index != filter.index);

        setFilters(filters);
        router.get(paginateData.path, filterToQuery(filters), { preserveState: true });
    }

    return {
        getColumns,
        getHideableColumns,
        setColumnVisible,
        setRowSelected,
        getRowSelected,
        setSelectedAll,
        getSelectedAll,
        getSelectedRows,
        getPageSize,
        getPageRows,
        getTotalPage,
        getCurrentPage,
        getPaginateLinks,
        getPaginateFullLinks,
        getSearch,
        onSearchChange,
        getSorts,
        getSortableDirection,
        onSortsChange,
        getFilteredItem,
        getFilteredValue,
        getFilterableColumns,
        onFilterChange,
    };
}

export function useSimpleTable<TData>({
    data,
    defaultPageSize = 10,
}: {
    data: TData[];
    defaultPageSize?: number;
}) {
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [currentPage, setCurrentPage] = useState(1);

    function onPageSizeChange(newPageSize: string) {
        setPageSize(Number(newPageSize));
        setCurrentPage(1);
    }

    function onCurrentPageChange(newCurrentPage: number) {
        setCurrentPage(newCurrentPage);
    }

    function getPageSize() {
        return `${pageSize}`;
    }

    function getTotalPage() {
        return Math.ceil(data.length / pageSize);
    }

    function getCurrentPage() {
        return currentPage;
    }

    function getCurrentPageData() {
        return data.slice(pageSize * (currentPage - 1), pageSize * currentPage);
    }

    function toFirstPage() {
        onCurrentPageChange(1);
    }

    function disableFirstPage() {
        return getCurrentPage() === 1;
    }

    function toLastPage() {
        onCurrentPageChange(getTotalPage());
    }

    function disableLastPage() {
        return getCurrentPage() === getTotalPage();
    }

    function toPrevPage() {
        onCurrentPageChange(getCurrentPage() - 1);
    }

    function disablePrevPage() {
        return getCurrentPage() === 1;
    }

    function toNextPage() {
        onCurrentPageChange(getCurrentPage() + 1);
    }

    function disableNextPage() {
        return getCurrentPage() === getTotalPage();
    }

    return {
        onPageSizeChange,
        onCurrentPageChange,
        getPageSize,
        getTotalPage,
        getCurrentPage,
        getCurrentPageData,
        toFirstPage,
        disableFirstPage,
        toLastPage,
        disableLastPage,
        toPrevPage,
        disablePrevPage,
        toNextPage,
        disableNextPage,
    };
}
