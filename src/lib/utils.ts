import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TableColumn } from '../typings';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function defineColumns<TData>(columns: Partial<TableColumn<TData>>[]) {
    function columnKey<TData>(column: Partial<TableColumn<TData>>) {
        if (Array.isArray(column.dataKey)) {
            return column.dataKey.join('.');
        }
        return (column.dataKey as string) ?? column.index;
    }

    return columns.map((column) => ({ ...column, index: columnKey(column) }));
}
