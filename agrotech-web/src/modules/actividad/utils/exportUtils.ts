import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

interface ExportData {
  actividades: any[];
}

export const exportToPDF = async ({ actividades }: ExportData) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Logo - Add image in top-left corner with proper aspect ratio
  try {
    const img = new Image();
    img.src = "/LogoTic.png";

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Convert to base64 and add to PDF
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const imgData = canvas.toDataURL("image/png");

      // Calculate dimensions maintaining aspect ratio
      const maxHeight = 20; // Max height in mm
      const aspectRatio = img.width / img.height;
      const logoHeight = maxHeight;
      const logoWidth = logoHeight * aspectRatio;

      doc.addImage(imgData, "PNG", 14, 10, logoWidth, logoHeight);
    }
  } catch (error) {
    console.log("Logo not available for PDF export:", error);
  }

  // Calculate text start position (after logo)
  const textStartX = 55; // Position after logo with margin

  // Title - positioned to the right of logo
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Historial de Actividades", textStartX, 18);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestión Agrícola AgroTech", textStartX, 24);

  // Date
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    textStartX,
    29
  );

  // Prepare table data
  const tableData = actividades.map((act) => {
    const responsablesCount = act.responsables?.length || 0;
    const totalLaborCost = act.costoManoObra || 0;
    const totalInputsCost =
      act.insumosUso?.reduce((sum: number, i: any) => sum + i.costoTotal, 0) ||
      0;
    const totalServicesCost =
      act.servicios?.reduce((sum: number, s: any) => sum + s.costo, 0) || 0;
    const grandTotal = totalLaborCost + totalInputsCost + totalServicesCost;

    const insumosNames =
      act.insumosUso
        ?.map((i: any) => i.insumo?.nombre)
        .filter(Boolean)
        .join(", ") || "N/A";

    const serviciosNames =
      act.servicios?.map((s: any) => s.nombreServicio).join(", ") || "N/A";

    return [
      act.nombre,
      act.descripcion || "Sin descripción",
      act.lote?.nombre || "N/A",
      act.subLote?.nombre || "N/A",
      act.cultivo?.nombre || "N/A",
      `${act.creadoPorUsuario?.nombre || ""} ${act.creadoPorUsuario?.apellido || ""
        }`.trim(),
      responsablesCount,
      act.horasActividad || 0,
      COP.format(act.precioHoraActividad || 0),
      COP.format(totalLaborCost),
      insumosNames,
      COP.format(totalInputsCost),
      serviciosNames,
      COP.format(totalServicesCost),
      COP.format(grandTotal),
      new Date(act.fecha).toLocaleDateString("es-CO"),
    ];
  });

  // Generate table
  autoTable(doc, {
    head: [
      [
        "Actividad",
        "Descripción",
        "Lote",
        "Sublote",
        "Cultivo",
        "Creador",
        "N° Resp.",
        "Horas",
        "Valor MO",
        "Total MO",
        "Insumos",
        "Total Insumos",
        "Servicios",
        "Total Servicios",
        "Total Actividad",
        "Fecha",
      ],
    ],
    body: tableData,
    startY: 36, // Increased to make room for logo and header
    styles: {
      fontSize: 6,
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [34, 197, 94], // green-500
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 25 },
      2: { cellWidth: 18 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 },
      6: { cellWidth: 10 },
      7: { cellWidth: 10 },
      8: { cellWidth: 15 },
      9: { cellWidth: 15 },
      10: { cellWidth: 22 },
      11: { cellWidth: 15 },
      12: { cellWidth: 20 },
      13: { cellWidth: 15 },
      14: { cellWidth: 18 },
      15: { cellWidth: 15 },
    },
  });

  // Save
  doc.save(`historial-actividades-${new Date().getTime()}.pdf`);
};

export const exportToExcel = ({ actividades }: ExportData) => {
  // Prepare data
  const excelData = actividades.map((act) => {
    const responsablesCount = act.responsables?.length || 0;
    const totalLaborCost = act.costoManoObra || 0;
    const totalInputsCost =
      act.insumosUso?.reduce((sum: number, i: any) => sum + i.costoTotal, 0) ||
      0;
    const totalServicesCost =
      act.servicios?.reduce((sum: number, s: any) => sum + s.costo, 0) || 0;
    const grandTotal = totalLaborCost + totalInputsCost + totalServicesCost;

    const insumosNames =
      act.insumosUso
        ?.map((i: any) => i.insumo?.nombre)
        .filter(Boolean)
        .join(", ") || "N/A";

    const cantidadesInsumos =
      act.insumosUso
        ?.map((i: any) => `${i.cantidadUso} ${i.insumo?.unidadUso || "unid"}`)
        .join(", ") || "N/A";

    const valoresInsumos =
      act.insumosUso?.map((i: any) => i.costoTotal).join(", ") || "N/A";

    const serviciosNames =
      act.servicios?.map((s: any) => s.nombreServicio).join(", ") || "N/A";

    const horasServicios =
      act.servicios?.map((s: any) => s.horas).join(", ") || "N/A";

    const preciosServicios =
      act.servicios?.map((s: any) => s.precioHora).join(", ") || "N/A";

    return {
      "Nombre Actividad": act.nombre,
      Tipo: act.tipo,
      Subtipo: act.subtipo,
      Descripción: act.descripcion || "Sin descripción",
      Lote: act.lote?.nombre || "N/A",
      Sublote: act.subLote?.nombre || "N/A",
      Cultivo: act.cultivo?.nombre || "N/A",
      "Nombre Creador": `${act.creadoPorUsuario?.nombre || ""} ${act.creadoPorUsuario?.apellido || ""
        }`.trim(),
      "ID Creador":
        act.creadoPorUsuario?.identificacion || act.creadoPorUsuarioId,
      "N° Responsables": responsablesCount,
      "Horas Actividad": act.horasActividad || 0,
      "Valor MO ($/h)": act.precioHoraActividad || 0,
      "Total Mano de Obra": totalLaborCost,
      Insumos: insumosNames,
      "Cantidad Insumos": cantidadesInsumos,
      "Valor Insumos": valoresInsumos,
      "Total Insumos": totalInputsCost,
      Servicios: serviciosNames,
      "Horas Servicios": horasServicios,
      "Servicio ($/h)": preciosServicios,
      "Total Servicios": totalServicesCost,
      "Total Actividad": grandTotal,
      Fecha: new Date(act.fecha).toLocaleDateString("es-CO"),
    };
  });

  // Create workbook
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 25 }, // Nombre Actividad
    { wch: 15 }, // Tipo
    { wch: 20 }, // Subtipo
    { wch: 30 }, // Descripción
    { wch: 20 }, // Lote
    { wch: 20 }, // Sublote
    { wch: 20 }, // Cultivo
    { wch: 25 }, // Nombre Creador
    { wch: 15 }, // ID Creador
    { wch: 15 }, // N° Responsables
    { wch: 15 }, // Horas Actividad
    { wch: 15 }, // Valor MO
    { wch: 20 }, // Total MO
    { wch: 30 }, // Insumos
    { wch: 25 }, // Cantidad Insumos
    { wch: 25 }, // Valor Insumos
    { wch: 20 }, // Total Insumos
    { wch: 30 }, // Servicios
    { wch: 20 }, // Horas Servicios
    { wch: 20 }, // Servicio ($/h)
    { wch: 20 }, // Total Servicios
    { wch: 20 }, // Total Actividad
    { wch: 15 }, // Fecha
  ];
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Historial Actividades");

  // Save
  XLSX.writeFile(wb, `historial-actividades-${new Date().getTime()}.xlsx`);
};
