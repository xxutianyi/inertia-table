'use client';

import { useDataTable, useSimpleTable } from '@/hooks/use-table';
import { cn } from '@/lib/utils';
import type { DataTableProps, SimpleTableProps, TableColumn } from '@/typings';
import { router } from '@inertiajs/react';
import _ from 'lodash';
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    ChevronsUpDownIcon,
    PlusCircleIcon,
    Settings2Icon,
    XIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from './ui/command';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type WithTable<TData, Props = unknown> = Props & { table: ReturnType<typeof useDataTable<TData>> };

function DataTableFilter<TData>({
    table,
    column,
}: WithTable<TData, { column: TableColumn<TData> }>) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <PlusCircleIcon className="mr-2 size-4" />
                    {column.title}
                    {table.getFilteredValue(column) && (
                        <>
                            <Separator orientation="vertical" className="mx-2 my-1 h-5" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                {table.getFilteredItem(column)?.label}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-50 p-0" align="start">
                <Command>
                    <CommandInput placeholder={column.title} />
                    <CommandList>
                        <CommandEmpty>无匹配项</CommandEmpty>
                        <CommandGroup>
                            {column.filter?.map((option) => {
                                const isSelected = table.getFilteredValue(column) === option.value;
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() =>
                                            table.onFilterChange({
                                                index: column.index,
                                                value: isSelected ? undefined : option.value,
                                            })
                                        }
                                    >
                                        <div
                                            className={cn(
                                                'mr-2 flex size-4 items-center justify-center rounded-lg border',
                                                isSelected
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-input [&_svg]:invisible',
                                            )}
                                        >
                                            <CheckIcon className="size-3.5" />
                                        </div>
                                        {option.icon && (
                                            <option.icon className="mr-2 size-4 text-muted-foreground" />
                                        )}
                                        <span>{option.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function DataTableToolbar<TData>({
    table,
    actions,
    showSearch,
}: WithTable<TData, { actions?: ReactNode; showSearch?: boolean }>) {
    return (
        <div className="rounded-lg py-2">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center gap-2">
                    {showSearch && (
                        <>
                            <Input
                                placeholder="搜索..."
                                value={table.getSearch()}
                                onChange={(event) => table.onSearchChange(event.target.value)}
                                className="mx-1 h-8 w-37.5 border-border lg:w-62.5"
                            />
                            {table.getSearch() && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => table.onSearchChange()}
                                    className="h-8 px-2 lg:px-3"
                                >
                                    重置
                                    <XIcon className="ml-2 size-4" />
                                </Button>
                            )}
                        </>
                    )}
                    {table.getFilterableColumns().map((column) => (
                        <DataTableFilter key={column.index} column={column} table={table} />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto hidden lg:flex">
                                <Settings2Icon className="mr-2 size-4" />
                                视图
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-37.5">
                            <DropdownMenuLabel>显示列</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table.getHideableColumns().map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.index}
                                        className="capitalize"
                                        checked={!column.hidden}
                                        onCheckedChange={(value) =>
                                            table.setColumnVisible(column.index, value)
                                        }
                                    >
                                        {column.title}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {actions}
                </div>
            </div>
        </div>
    );
}

function DataTableFooter<TData>({
    table,
    sizeOptions,
    showPageNumbers,
}: WithTable<TData, { sizeOptions?: number[]; showPageNumbers?: boolean }>) {
    function onSizeChange(value: string) {
        router.get(window.location.href, {
            page: 1,
            size: Number.parseInt(value),
        });
    }

    return (
        <div className="rounded-lg py-2">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    {table.getSelectedRows() && table.getSelectedRows().length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            已勾选&nbsp;{table.getSelectedRows().length}&nbsp;行，共&nbsp;
                            {table.getPageRows()}&nbsp;行
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">每页数量</p>
                        <Select value={table.getPageSize()} onValueChange={onSizeChange}>
                            <SelectTrigger className="h-8 w-17.5">
                                <SelectValue placeholder={table.getPageSize()} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {(sizeOptions ?? [10, 20, 30, 40, 50]).map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center space-x-6 lg:space-x-8">
                    {!showPageNumbers && (
                        <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
                            第&nbsp;{table.getCurrentPage()}&nbsp;页，共&nbsp;{table.getTotalPage()}
                            &nbsp;页
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        {showPageNumbers ? (
                            table
                                .getPaginateFullLinks()
                                ?.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        onClick={() => router.get(link.url ?? '')}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))
                        ) : (
                            <>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="size-8"
                                    onClick={table.getPaginateLinks().first.action}
                                    disabled={table.getPaginateLinks().first.disabled}
                                >
                                    <span className="sr-only">第一页</span>
                                    <ChevronsLeftIcon className="size-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="size-8"
                                    onClick={table.getPaginateLinks().prev.action}
                                    disabled={table.getPaginateLinks().prev.disabled}
                                >
                                    <span className="sr-only">上一页</span>
                                    <ChevronLeftIcon className="size-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="size-8"
                                    onClick={table.getPaginateLinks().next.action}
                                    disabled={table.getPaginateLinks().next.disabled}
                                >
                                    <span className="sr-only">下一页</span>
                                    <ChevronRightIcon className="size-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="size-8"
                                    onClick={table.getPaginateLinks().last.action}
                                    disabled={table.getPaginateLinks().last.disabled}
                                >
                                    <span className="sr-only">最后页</span>
                                    <ChevronsRightIcon className="size-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DataTableTitle<TData>({
    column,
    table,
}: WithTable<TData, { column: TableColumn<TData> }>) {
    if (!column.sortable) {
        return column.titleRender ? column.titleRender() : column.title;
    }

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                        <span>{column.titleRender ? column.titleRender() : column.title}</span>
                        {table.getSortableDirection(column) === 'desc' ? (
                            <ArrowDownIcon className="ml-2 size-4" />
                        ) : table.getSortableDirection(column) === 'asc' ? (
                            <ArrowUpIcon className="ml-2 size-4" />
                        ) : (
                            <ChevronsUpDownIcon className="ml-2 size-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem
                        onClick={() =>
                            table.onSortsChange({ column: column.index, direction: 'asc' })
                        }
                    >
                        <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground/70" />
                        从小到大（升序）
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            table.onSortsChange({ column: column.index, direction: 'desc' })
                        }
                    >
                        <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground/70" />
                        从大到小（降序）
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => table.onSortsChange({ column: column.index })}>
                        <XIcon className="mr-2 size-3.5 text-muted-foreground/70" />
                        取消
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function DataTable<TData>({
    rowKey,
    columns,
    paginateData,
    sizeOptions,
    onRowSelection,
    toolbarAction,
    className,
    showSearch = true,
    showPageNumbers = false,
}: DataTableProps<TData>) {
    rowKey = rowKey ?? ('id' as keyof TData);

    const table = useDataTable({ rowKey, columns, paginateData, onRowSelection });

    const renderedColumns: TableColumn<TData>[] = onRowSelection
        ? [
              {
                  index: 'select',
                  titleRender: () => (
                      <Checkbox
                          checked={table.getSelectedAll()}
                          onCheckedChange={(value) => table.setSelectedAll(!!value)}
                      />
                  ),
                  tableRowRender: (data) => (
                      <Checkbox
                          checked={table.getRowSelected(data)}
                          onCheckedChange={(value) => table.setRowSelected(data, value)}
                      />
                  ),
              },
              ...table.getColumns(),
          ]
        : table.getColumns();

    return (
        <div className={cn(className, 'w-full space-y-4')}>
            <DataTableToolbar table={table} actions={toolbarAction} showSearch={showSearch} />

            <div className="overflow-hidden rounded-3xl border">
                <Table className="">
                    <TableHeader>
                        <TableRow>
                            {renderedColumns.map((column, index) => (
                                <TableHead key={index} id={column.index} colSpan={column.colSpan}>
                                    <DataTableTitle column={column} table={table} />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginateData.data?.length ? (
                            paginateData.data.map((item, index) => (
                                <TableRow key={index}>
                                    {renderedColumns.map((column) => (
                                        <TableCell key={column.index} colSpan={column.colSpan}>
                                            {column.tableRowRender
                                                ? column.tableRowRender(item)
                                                : column.dataKey
                                                  ? (_.get(item, column.dataKey) ?? '-')
                                                  : '-'}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    暂无数据
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTableFooter
                table={table}
                sizeOptions={sizeOptions}
                showPageNumbers={showPageNumbers}
            />
        </div>
    );
}

export function SimpleTable<TData>({
    data,
    columns,
    sizeOptions,
    className,
}: SimpleTableProps<TData>) {
    const table = useSimpleTable({ data: data ?? [] });

    return (
        <div className={cn(className, 'w-full space-y-4')}>
            <div className="overflow-hidden rounded-3xl border">
                <Table className="">
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead key={index} id={column.index} colSpan={column.colSpan}>
                                    {column.titleRender ? column.titleRender() : column.title}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {table.getCurrentPageData()?.length ? (
                            table.getCurrentPageData().map((item, index) => (
                                <TableRow key={index}>
                                    {columns.map((column) => (
                                        <TableCell key={column.index} colSpan={column.colSpan}>
                                            {column.tableRowRender
                                                ? column.tableRowRender(item)
                                                : column.dataKey
                                                  ? (_.get(item, column.dataKey) ?? '-')
                                                  : '-'}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    暂无数据
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="rounded-lg py-2">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">每页数量</p>
                            <Select
                                value={table.getPageSize()}
                                onValueChange={table.onPageSizeChange}
                            >
                                <SelectTrigger className="h-8 w-17.5">
                                    <SelectValue placeholder={table.getPageSize()} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {(sizeOptions ?? [10, 20, 30, 40, 50]).map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
                            第&nbsp;{table.getCurrentPage()}&nbsp;页，共&nbsp;{table.getTotalPage()}
                            &nbsp;页
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                size="icon"
                                variant="outline"
                                className="size-8"
                                onClick={table.toFirstPage}
                                disabled={table.disableFirstPage()}
                            >
                                <span className="sr-only">第一页</span>
                                <ChevronsLeftIcon className="size-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="size-8"
                                onClick={table.toPrevPage}
                                disabled={table.disablePrevPage()}
                            >
                                <span className="sr-only">上一页</span>
                                <ChevronLeftIcon className="size-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="size-8"
                                onClick={table.toNextPage}
                                disabled={table.disableNextPage()}
                            >
                                <span className="sr-only">下一页</span>
                                <ChevronRightIcon className="size-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="size-8"
                                onClick={table.toLastPage}
                                disabled={table.disableLastPage()}
                            >
                                <span className="sr-only">最后页</span>
                                <ChevronsRightIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
