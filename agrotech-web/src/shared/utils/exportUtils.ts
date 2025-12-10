// Export utilities without external dependencies

import * as XLSX from 'xlsx-js-style';

export function exportToXLSX(data: any[] | any[][], filename: string) {
    // Check if data is Array of Arrays (AoA) or Array of Objects (AoO)
    const isAoA = Array.isArray(data[0]) || data.length === 0;

    const ws = isAoA
        ? XLSX.utils.aoa_to_sheet(data as any[][])
        : XLSX.utils.json_to_sheet(data as any[]);

    // Auto-adjust column width (heuristic for both AoA and AoO)
    const colWidths: number[] = [];

    // Helper to update max width
    const updateWidth = (idx: number, val: any) => {
        let content = val;
        // If it's a SheetJS cell object { v: 'value', t: 's', ... }, extract v
        if (typeof val === 'object' && val !== null && 'v' in val) {
            content = val.v;
        }

        const str = String(content || '');
        // Rough estimate: specific characters might be wider, but length is a good proxy
        const len = str.length;
        if (!colWidths[idx] || len > colWidths[idx]) {
            colWidths[idx] = len;
        }
    };

    if (isAoA) {
        (data as any[][]).forEach(row => {
            row.forEach((cell, idx) => updateWidth(idx, cell));
        });
    } else {
        (data as any[]).forEach(row => {
            Object.values(row).forEach((cell, idx) => updateWidth(idx, cell));
        });
    }

    // Apply widths with some padding, maxing out at 60 chars
    ws['!cols'] = colWidths.map(w => ({ width: Math.min(w + 5, 60) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportToPDFSimple() {
    window.print();
}
