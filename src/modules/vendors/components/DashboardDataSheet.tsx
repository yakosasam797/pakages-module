import { DataSheetCell, DataSheetRow } from "@paryatech/design-system";
import "./DashboardDataSheet.css";

/**
 * Extends an otherwise short dashboard table to the bottom of its page shell.
 * The empty cells preserve the table's existing column rules without adding a
 * fake data row to the accessibility tree.
 */
export function DashboardDataSheetFill({ columns }: { columns: number }) {
  return (
    <DataSheetRow className="dashboard-sheet__fill" aria-hidden="true">
      {Array.from({ length: columns }, (_, index) => (
        <DataSheetCell key={index} />
      ))}
    </DataSheetRow>
  );
}
