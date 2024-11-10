import { Pencil, X } from "lucide-react";
import _ from "lodash";

export type TableColumn = {
  header: string;
  accessor: string;
  render?: (value: any) => React.ReactNode;
};

export type ActionProps = {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const Table = ({
  data,
  columns,
  actions,
}: {
  data: any[];
  columns: TableColumn[];
  actions?: ActionProps;
}) => {
  return (
    <div className="h-96 w-full resize overflow-auto rounded-xl border border-secondary-light_grey bg-secondary-white/70 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-primary-green to-primary-blue">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="text-nowrap p-5 text-center text-input_or_label font-headline text-secondary-white first:rounded-tl-lg"
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="rounded-tr-lg p-5 text-center text-input_or_label font-headline text-secondary-white">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-light_grey">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="transition-colors duration-200 hover:bg-secondary-light_grey/50"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-5 text-center text-body text-accent-dark-blue"
                  >
                    {column.render
                      ? column.render(_.get(row, column.accessor))
                      : _.get(row, column.accessor)}
                  </td>
                ))}
                {actions && (
                  <td className="p-5">
                    <div className="flex justify-center items-center gap-3">
                      {actions.onEdit && (
                        <button
                          onClick={() => actions.onEdit?.(row._id)}
                          className="rounded-lg p-2 text-primary-blue transition-all duration-200 hover:bg-secondary-light_grey hover:text-accent-dark-blue"
                          title="Edit"
                        >
                          <Pencil size={20} />
                        </button>
                      )}
                      {actions.onDelete && (
                        <button
                          onClick={() => actions.onDelete?.(row._id)}
                          className="rounded-lg p-2 text-primary-blue transition-all duration-200 hover:bg-secondary-light_grey hover:text-accent-dark-blue"
                          title="Delete"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="p-8 text-center text-body text-accent-dark-blue/60"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
