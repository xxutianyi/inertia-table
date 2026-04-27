import type {
    FilterState,
    PaginateData,
    RouterTableApi,
    TableColumn,
    TableData,
} from '@/lib/table';
import { router } from '@inertiajs/react';
import qs from 'qs';
import { useState } from 'react';

export type UseTableProps<TData extends TableData> = {
    rowKey?: string;
    data: PaginateData<TData>;
    columns: TableColumn<TData>[];
    onSelectChange?: (rowKeys: string[]) => void;
    saveStateToQuery?: boolean;
};

export function useRouterTable<TData extends TableData>(props: UseTableProps<TData>) {
    const query = qs.parse(window.location.search.substring(1));

    const { rowKey, columns, data, onSelectChange } = props;

    const [sorts, setSorts] = useState<string>(query?.['sorts'] as string);
    const [search, setSearch] = useState<string>(query?.['search'] as string);
    const [filters, setFilters] = useState<Record<string, FilterState>>(filtersFromQuery());

    const [tableColumns, setTableColumns] = useState(columns);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    /**
     * 从Query获取Filter状态
     */
    function filtersFromQuery() {
        const filters: Record<string, FilterState> = {};
        const columns = getFilterableColumns().map((c) => c.index);
        Object.keys(query)
            .filter((key) => columns.includes(key))
            .map((key) => {
                filters[key] = query?.[key] as string;
            });
        return filters;
    }

    /**
     * 同步更新选中行
     * @param newSelected
     */
    function onSelectedRowChange(newSelected: string[]) {
        setSelectedRows(newSelected);
        onSelectChange?.(newSelected);
    }

    /**
     * 获取当前页数据
     */
    function getData() {
        return data?.data ?? [];
    }

    /**
     * 获取当前页码
     */
    function getPage() {
        return data.current_page;
    }

    /**
     * 获取当前每页数
     */
    function getSize() {
        return data.per_page.toString();
    }

    /**
     * 获取当前搜索
     */
    function getSearch() {
        return search ?? '';
    }

    /**
     * 获取当前页的行数
     */
    function getPageRows() {
        return data?.data.length ?? 0;
    }

    /**
     * 获取总页数
     */
    function getTotalPage() {
        return data.last_page > 1 ? data.last_page : 1;
    }

    /**
     * 获取Row Key
     * @param dataItem
     */
    function getRowKey(dataItem: TData) {
        return dataItem[rowKey ?? 'id'] as string;
    }

    /**
     * 获取要显示的列
     */
    function getColumns() {
        return tableColumns.filter((column) => !column.hidden);
    }

    /**
     * 获取可隐藏的列
     */
    function getHideableColumns() {
        return tableColumns.filter((column) => column.hideable || (column.title && column.dataKey));
    }

    /**
     * 获取可以筛选的列
     */
    function getFilterableColumns() {
        return columns.filter(
            (column) => column.title && column.filters && column.filters.length > 0,
        );
    }

    /**
     * 获取列筛选的值
     * @param column
     */
    function getFilteredState(column: string) {
        return filters?.[column];
    }

    /**
     * 获取当前筛选的原始选项
     * @param column
     */
    function getFilteredStateOption(column: TableColumn<TData>) {
        return column.filters?.find((filter) => filter?.value == getFilteredState(column.index));
    }

    /**
     * 获取已选中的行Key
     */
    function getSelectedRows() {
        return selectedRows;
    }

    /**
     * 获取行的选中状态
     * @param dataItem
     */
    function getRowSelectedState(dataItem: TData) {
        return !!selectedRows.find((row) => row === getRowKey(dataItem));
    }

    /**
     * 获取全选的状态
     */
    function getRowSelectedAllState() {
        if (selectedRows.length === 0) return false;
        if (selectedRows.length === data?.data.length) return true;
        return 'indeterminate';
    }

    /**
     * 获取列排序状态
     */
    function getSortState() {
        if (!sorts) return [];

        return sorts
            .split(',')
            .map((sort) => {
                const sortMeta = sort.split(':');
                if (sortMeta.length !== 2) return undefined;
                return { column: sortMeta[0], direction: sortMeta[1] === 'asc' ? 'asc' : 'desc' };
            })
            .filter((value) => !!value);
    }

    /**
     * 获取列排序值
     * @param column
     */
    function getColumnSortState(column: string) {
        const direction = getSortState()?.find((sort) => sort.column === column)?.direction;
        return direction ? (direction === 'asc' ? 'asc' : 'desc') : undefined;
    }

    /**
     * 修改当前页面
     * @param newPage
     */
    function setNewPage(newPage: number) {
        if (newPage >= 1 && newPage <= getTotalPage()) {
            router.get(window.location.href, { page: newPage });
        }
    }

    /**
     * 修改每页数量
     * @param newSize
     */
    function setNewSize(newSize: number | string) {
        if (Number(newSize) > 0) {
            router.get(data.path, { page: 1, size: newSize });
        }
    }

    /**
     * 修改搜索字符串
     * @param search
     */
    function setNewSearch(search?: string) {
        setSearch(search ?? '');
        router.get(window.location.href, { search }, { preserveState: true });
    }

    /**
     * 设置列可见性
     * @param index
     * @param visible
     */
    function setColumnVisibleState(index: TableColumn<any>['index'], visible: boolean) {
        setTableColumns(
            tableColumns.map((column) => {
                if (column.index === index) column.hidden = !visible;
                return column;
            }),
        );
    }

    /**
     * 设置行是否选中
     * @param dataItem
     * @param selected
     */
    function setRowSelectedState(dataItem: TData, selected: boolean | 'indeterminate') {
        onSelectedRowChange(
            selected
                ? [...selectedRows, getRowKey(dataItem)]
                : selectedRows.filter((row) => row !== getRowKey(dataItem)),
        );
    }

    /**
     * 设置行是否全选
     * @param selected
     */
    function setRowSelectedAllState(selected: boolean | 'indeterminate') {
        onSelectedRowChange(selected && data ? data?.data.map(getRowKey) : []);
    }

    /**
     * 设置列排序
     * @param column
     * @param direction
     */
    function setSortState(column: string, direction?: string) {
        const currentSort = getSortState().filter((s) => s.column !== column);
        const sortsString = (direction ? [...currentSort, { column, direction }] : currentSort)
            .map((s) => `${s.column}:${s.direction}`)
            .join(',');

        setSorts(sortsString);
        router.get(window.location.href, { sorts: sortsString }, { preserveState: true });
    }

    /**
     * 设置列筛选
     * @param index
     * @param value
     */
    function setFilterState(index: string, value?: string | null) {
        const newFilters = { ...filters, [index]: value ?? null };
        setFilters(newFilters);
        router.get(window.location.href, newFilters, { preserveState: true });
    }

    return {
        getData,
        getPage,
        getSize,
        getSearch,
        getPageRows,
        getTotalPage,
        getColumns,
        getHideableColumns,
        getSelectedRows,
        getRowSelectedState,
        getRowSelectedAllState,
        getColumnSortState,
        getFilteredState,
        getFilteredStateOption,
        getFilterableColumns,

        setNewPage,
        setNewSize,
        setNewSearch,
        setSortState,
        setColumnVisibleState,
        setRowSelectedState,
        setRowSelectedAllState,
        setFilterState,

        shouldAddSelectColumn: () => !!onSelectChange,
    } satisfies RouterTableApi<TData>;
}
