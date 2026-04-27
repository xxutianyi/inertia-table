'use client';

import { selectColumn } from '@/components/data-table-column';
import { DataTableFooter } from '@/components/data-table-footer';
import { DataTableTitle } from '@/components/data-table-title';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useRouterTable } from '@/hooks/use-router-table';
import type { PaginateData, TableColumn, TableData } from '@/lib/table';
import { cn } from '@/lib/utils';
import _ from 'lodash';
import type { ReactNode } from 'react';

export type DataTableProps<TData extends TableData> = {
    rowKey?: string;
    data: PaginateData<TData>;
    columns: TableColumn<TData>[];
    onSelectChange?: (rowKeys: string[]) => void;
    toolbarAction?: ReactNode;
    showSearchInput?: boolean;
    pageSizeOptions?: number[];
    saveStateToQuery?: boolean;
    className?: string;
};

export function RouterTable<TData extends TableData>({
    rowKey = 'id',
    data,
    columns,
    onSelectChange,
    toolbarAction,
    showSearchInput = true,
    pageSizeOptions = [10, 25, 50],
    className,
}: DataTableProps<TData>) {
    const table = useRouterTable({ rowKey, columns, data, onSelectChange });

    const tableColumns: TableColumn<TData>[] = table.shouldAddSelectColumn()
        ? [selectColumn(table), ...table.getColumns()]
        : table.getColumns();

    return (
        <div className={cn(className, 'w-full space-y-4')}>
            <DataTableToolbar table={table} actions={toolbarAction} showSearch={showSearchInput} />

            <div className="overflow-hidden rounded-3xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {tableColumns.map((column, index) => (
                                <TableHead key={index} id={column.index} colSpan={column.colSpan}>
                                    <DataTableTitle column={column} table={table} />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {table.getData().length > 0 ? (
                            table.getData().map((item, index) => (
                                <TableRow key={index}>
                                    {tableColumns.map((column) => (
                                        <TableCell key={column.index} colSpan={column.colSpan}>
                                            {column.tableRowRender && column.tableRowRender(item)}
                                            {!column.tableRowRender &&
                                                (column.dataKey
                                                    ? (_.get(item, column.dataKey) ?? '-')
                                                    : '-')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={tableColumns.length}
                                    className="h-24 text-center"
                                >
                                    暂无数据
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTableFooter table={table} sizeOptions={pageSizeOptions} />
        </div>
    );
}
