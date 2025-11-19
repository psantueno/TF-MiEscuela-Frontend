import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoOficial from '../../assets/img/logo_oficial.png';

const loadLogo = async () => {
  try {
    const resp = await fetch(logoOficial);
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('No se pudo cargar el logo institucional:', e);
    return null;
  }
};

const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/D';
  if (typeof value === 'number') return Number.isInteger(value) ? value : value.toFixed(2);
  return String(value);
};

const mapKpis = (kpis = {}) =>
  Object.entries(kpis).map(([key, value]) => [
    key.replace(/_/g, ' '),
    formatValue(value),
  ]);

export const generarReportePDF = async ({ scope, reporte }) => {
  if (!reporte) return;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const logo = await loadLogo();
  if (logo) doc.addImage(logo, 'PNG', 14, 10, 22, 22, undefined, 'FAST');

  doc.setFontSize(16);
  doc.text('MiEscuela 4.0', 40, 20);
  doc.setFontSize(12);
  doc.text('Informe de Rendimiento Académico', 40, 28);

  let contextLine = '';
  if (scope === 'curso') {
    contextLine = `Curso: ${reporte.data?.context?.anio_escolar ?? ''}° ${
      reporte.data?.context?.division ?? ''
    } · Ciclo ${reporte.data?.context?.ciclo ?? ''}`;
  } else if (scope === 'materia') {
    contextLine = `Materia: ${reporte.data?.context?.nombre ?? ''}`;
  } else if (scope === 'alumno') {
    contextLine = `Alumno: ${reporte.data?.context?.nombre ?? ''}`;
  }
  if (contextLine) doc.text(contextLine, 14, 42);
  doc.text(
    `Período: ${reporte.fecha_desde || '-'} al ${reporte.fecha_hasta || '-'}`,
    14,
    contextLine ? 50 : 42
  );

  const rows = mapKpis(reporte.data?.kpis || {});
  if (rows.length) {
    autoTable(doc, {
      startY: contextLine ? 56 : 48,
      head: [['Indicador', 'Valor']],
      body: rows,
      styles: { fontSize: 10, halign: 'left' },
      headStyles: { fillColor: [10, 46, 117], textColor: 255 },
    });
  }

  let nextY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 70;

  const alertas = reporte.data?.alertas || [];
  if (alertas.length) {
    doc.setFontSize(12);
    doc.text('Alertas detectadas', 14, nextY);
    nextY += 4;
    autoTable(doc, {
      startY: nextY,
      head: [['Alumno', 'Motivo', 'Riesgo']],
      body: alertas.map((alerta) => [
        alerta.alumno || '-',
        alerta.motivo || '-',
        (alerta.severity || '').toUpperCase(),
      ]),
      styles: { fontSize: 9 },
    });
    nextY = doc.lastAutoTable.finalY + 8;
  }

  if (reporte.resumen) {
    doc.setFontSize(12);
    doc.text('Resumen IA', 14, nextY);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(reporte.resumen, 180);
    doc.text(splitText, 14, nextY + 6);
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`rendimiento-${scope}-${timestamp}.pdf`);
};
