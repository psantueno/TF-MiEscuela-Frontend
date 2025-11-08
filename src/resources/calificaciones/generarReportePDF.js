import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoOficial from "../../assets/img/logo_oficial.png";

const mapRows = (calificaciones, tableColumnHeaders) => {
    const mappedRows = [];
    calificaciones.forEach((calificacion) => {
        const existingRow = mappedRows.find(row => row[0] === calificacion.alumno);
        if (existingRow) {
            const tipoIndex = tableColumnHeaders.indexOf(calificacion.tipo);
            if (tipoIndex !== -1) {
                existingRow[tipoIndex] = calificacion.nota;
            }
        } else {
            const newRow = new Array(tableColumnHeaders.length).fill("");
            newRow[0] = calificacion.alumno;
            const tipoIndex = tableColumnHeaders.indexOf(calificacion.tipo);
            if (tipoIndex !== -1) {
                newRow[tipoIndex] = calificacion.nota;
            }
            mappedRows.push(newRow);
        }
    });
    return mappedRows;
};

export async function generarReportePDF({ type, curso = null, alumno = null, calificaciones = [], materia = null }) {
    const materias = Array.from(new Set(calificaciones.map(c => c.id_materia)));
    const anios = Array.from(new Set(calificaciones.map(c => c.ciclo_lectivo)));

    const tableColumnHeaders = ["Alumno"];
    const uniqueTipos = Array.from(new Set(calificaciones.map(c => c.tipo)));
    uniqueTipos.forEach((tipo) => {
        tableColumnHeaders.push(tipo);
    });
    console.log("alumno", alumno);
    try{
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

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
        doc.text("MiEscuela 4.0", 40, 20);
        doc.setFontSize(12);
        doc.text("Reporte de Calificaciones", 40, 27);
        doc.setFontSize(12);
        if(type === "curso") doc.text(`Curso: ${curso.name}`, 14, 40);
        if(type === "alumno") doc.text(`Alumno: ${alumno.usuario.apellido} ${alumno.usuario.nombre}`, 14, 40);
        if(materia) doc.text(`Materia: ${materia.nombre}`, 14, 45);

        // ——— Tabla de calificaciones ———
        if(type === "curso"){
            const startY = 50;

            anios.forEach((anio) => {
                // Título del ciclo
                doc.setFontSize(10);
                doc.text(`Ciclo lectivo ${anio}`, doc.internal.pageSize.getWidth() / 2, startY, { align: "center" });

                let currentY = startY + 10; // posición inicial debajo del título

                if(materia){
                    const filteredRows = calificaciones
                        .filter(c => c.ciclo_lectivo === anio && c.id_materia === materia.id_materia)

                    const mappedRows = mapRows(filteredRows, tableColumnHeaders);
                    
                    autoTable(doc, {
                        startY: currentY,
                        head: [tableColumnHeaders],
                        body: mappedRows,
                        tableWidth: 'auto',
                            styles: { 
                                fontSize: 10, 
                                halign: "center",
                                cellWidth: 'auto', 
                                overflow: 'linebreak',
                                cellPadding: 2,
                            },
                        headStyles: { fillColor: [43, 62, 76], textColor: 255 },
                        alternateRowStyles: { fillColor: [245, 247, 250] },
                    });
                }else{
                    materias.forEach((mat) => {
                        doc.setFontSize(11);
                        doc.text(`Materia: ${calificaciones.find(c => c.id_materia === mat).materia}`, 14, currentY);

                        const filteredRows = calificaciones
                            .filter(c => c.ciclo_lectivo === anio && c.id_materia === mat);

                        const mappedRows = mapRows(filteredRows, tableColumnHeaders);

                        autoTable(doc, {
                            startY: currentY + 5,
                            head: [tableColumnHeaders],
                            body: mappedRows,
                            tableWidth: 'auto',
                            styles: { 
                                fontSize: 10, 
                                halign: "center",
                                cellWidth: 'auto', 
                                overflow: 'linebreak',
                                cellPadding: 2,
                            },
                            headStyles: { fillColor: [43, 62, 76], textColor: 255 },
                            alternateRowStyles: { fillColor: [245, 247, 250] },
                        });

                        // Actualizar Y para la siguiente tabla
                        currentY = doc.lastAutoTable.finalY + 10;

                        // Si se está acercando al final de la página, agregar una nueva
                        if (currentY > doc.internal.pageSize.getHeight() - 40) {
                            doc.addPage();
                            currentY = 30;
                        }
                    });
                }
                // Espacio extra entre ciclos lectivos
                currentY += 20;
            });
        }

        if(type === "alumno"){
            const startY = 50; 
            let currentY = startY;

            anios.forEach((anio) => {
                // Título del ciclo
                doc.setFontSize(10);
                doc.text(`Ciclo lectivo ${anio}`, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });

                currentY += 10;

                if(materia){
                    const filteredRows = calificaciones
                        .filter(c => c.ciclo_lectivo === anio && c.id_materia === materia.id_materia)

                    const mappedRows = mapRows(filteredRows, tableColumnHeaders);

                    autoTable(doc, {
                        startY: currentY,
                        head: [tableColumnHeaders],
                        body: mappedRows,
                        tableWidth: 'auto',
                            styles: { 
                                fontSize: 10, 
                                halign: "center",
                                cellWidth: 'auto', 
                                overflow: 'linebreak',
                                cellPadding: 2,
                            },
                        headStyles: { fillColor: [43, 62, 76], textColor: 255 },
                        alternateRowStyles: { fillColor: [245, 247, 250] },
                    });

                    currentY = doc.lastAutoTable.finalY + 20; // mover después de la tabla
                }else{
                    materias.forEach((mat) => {
                        doc.setFontSize(11);
                        doc.text(`Materia: ${calificaciones.find(c => c.id_materia === mat).materia}`, 14, currentY);

                        const filteredRows = calificaciones
                            .filter(c => c.ciclo_lectivo === anio && c.id_materia === mat)
                        const mappedRows = mapRows(filteredRows, tableColumnHeaders);

                        autoTable(doc, {
                            startY: currentY + 5,
                            head: [tableColumnHeaders],
                            body: mappedRows,
                            tableWidth: 'auto',
                            styles: { 
                                fontSize: 10, 
                                halign: "center",
                                cellWidth: 'auto', 
                                overflow: 'linebreak',
                                cellPadding: 2,
                            },
                            headStyles: { fillColor: [43, 62, 76], textColor: 255 },
                            alternateRowStyles: { fillColor: [245, 247, 250] },
                        });
                        // Actualizar Y para la siguiente tabla
                        currentY = doc.lastAutoTable.finalY + 10;
                        // Si se está acercando al final de la página, agregar una nueva
                        if (currentY > doc.internal.pageSize.getHeight() - 40) {
                            doc.addPage();
                            currentY = 30;
                        }
                    });
                }
                // Espacio extra entre ciclos lectivos
                currentY += 10;
            });
        }

        // ——— Guardar PDF ———
        const fileNameParts = ["Reporte_Calificaciones"];
        if(type === "curso" && curso) fileNameParts.push(`Curso_${curso.name}`);
        if(type === "alumno" && alumno) fileNameParts.push(`Alumno_${alumno.usuario.apellido}_${alumno.usuario.nombre}`);
        if(materia) fileNameParts.push(`Materia_${materia.nombre.replace(/\s+/g, "_")}`);
        const fileName = fileNameParts.join("_") + ".pdf";
        doc.save(fileName);
    }catch(error){
        console.error("Error generando reporte PDF de calificaciones:", error);
    }
}