
interface TableProps<T> {
  columns: { key: keyof T | string; header: string }[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends object>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data',
  className = '',
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-border ${className}`}>
      <table className="w-full min-w-[400px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-background-secondary">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 font-medium text-text-secondary"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-text-secondary">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="border-b border-border bg-background-primary last:border-b-0 hover:bg-background-secondary"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-text-primary">
                    {String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
