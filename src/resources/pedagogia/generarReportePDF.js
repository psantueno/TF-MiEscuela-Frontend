import { jsPDF } from "jspdf";
import logoOficial from "../../assets/img/logo_oficial.png";

export async function generarReportePDF({ curso = null, alumno = null, materia = null, informes = [] }) {
    try{
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const margenIzq = 15;
        const margenDer = 15;
        const margenSup = 15;
        const margenInf = 15;
        const anchoUtil = 210 - margenIzq - margenDer;
        const altoPagina = 297;

        let y = 20; // posición vertical actual

        // ——— Encabezado institucional (logo) ———
        try {
            const resp = await fetch(logoOficial);
            const blob = await resp.blob();
            const reader = new FileReader();
            const base64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
            });
            doc.addImage(base64, "PNG", 14, 10, 22, 22, undefined, "FAST");
        } catch (e) {
            console.warn("No se pudo cargar el logo institucional:", e);
        }

        // ——— Encabezados ———
        doc.setFontSize(16);
        doc.text("MiEscuela 4.0", 40, y);
        y += 7;
        doc.setFontSize(12);
        doc.text("Informe pedagógico", 40, y);
        y += 13;

        doc.setFontSize(10);
        doc.text(`Alumno: ${alumno.usuario.apellido} ${alumno.usuario.nombre}`, margenIzq, y);
        y += 5;
        doc.text(`Curso: ${curso.name}`, margenIzq, y);
        y += 5;
        if (materia) {
        doc.text(`Materia: ${materia.nombre}`, margenIzq, y);
        y += 5;
        }

        y += 5; // espacio antes de los informes

        // ——— Lista de informes ———
        for (const [index, informe] of informes.entries()) {
            // Verificar salto de página
            if (y > altoPagina - margenInf - 40) {
                doc.addPage();
                y = margenSup;
            }
            console.log(informe);
            doc.setFontSize(14);
            doc.setFont(undefined, "bold");
            const title = materia ? `Fecha: ${informe.fecha}` : `Fecha: ${informe.fecha} - ${informe.materia}`;
            doc.text(title, margenIzq, y);
            y += 7;

            doc.setFontSize(12);
            doc.setFont(undefined, "normal");

            // Ajustar texto largo al ancho disponible
            const splitContenido = doc.splitTextToSize(informe.contenido, anchoUtil);
            doc.text(splitContenido, margenIzq, y);

            // Calcular espacio usado
            const fontSize = doc.internal.getFontSize();
            const lineHeight = fontSize * 0.35; // aproximado
            const altoContenido = splitContenido.length * lineHeight;

            y += altoContenido + 5;

            // Asesor pedagógico
            doc.setFontSize(10);
            doc.text(`Asesor pedagógico: ${informe.asesorPedagogico}`, margenIzq, y);
            y += 10; // espacio entre informes
        }

        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);

            // Altura dinámica según orientación
            const pageHeight = doc.internal.pageSize.getHeight();
            const footerY = pageHeight - 10; // margen de 10 mm desde el borde inferior

            doc.text(
                `Generado por MiEscuela 4.0 — ${formatearFecha(new Date().toISOString())}`,
                14,
                footerY
            );

            // Usar el ancho dinámico para alinear a la derecha
            const pageWidth = doc.internal.pageSize.getWidth();
            doc.text(
                `Página ${i} de ${pageCount}`,
                pageWidth - 14,
                footerY,
                { align: "right" }
            );
        }


        // ——— Guardar PDF ———
        const fileNameParts = ["Reporte_Informes_Pedagogicos"];
        fileNameParts.push(`Alumno_${alumno.usuario.apellido}_${alumno.usuario.nombre}`);
        fileNameParts.push(`Curso_${curso.name}`);
        if(materia) fileNameParts.push(`Materia_${materia.nombre.replace(/\s+/g, "_")}`);
        const fileName = fileNameParts.join("_") + ".pdf";
        doc.save(fileName);
    }catch(error){
        console.error("Error generando reporte PDF de informes pedagógicos:", error);
    }
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return "—";
    const d = new Date(fechaISO);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}