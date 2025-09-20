export function exportToCsv(filename: string, rows: any[]) {
  if (!rows.length) return;

  const separator = ",";
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.join(separator) +
    "\n" +
    rows
      .map((row) =>
        keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? "" : row[k];
            cell = cell instanceof Date ? cell.toISOString() : cell.toString();
            return `"${cell.replace(/"/g, '""')}"`;
          })
          .join(separator)
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}