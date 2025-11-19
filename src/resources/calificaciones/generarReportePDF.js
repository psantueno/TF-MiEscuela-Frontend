import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoOficial from "../../assets/img/logo_oficial.png";

const mapRows = (calificaciones, tipos) => {
    const mappedRows = [];
    const uniqueAlumnos = [];

    calificaciones.forEach((calificacion) => {
        if(!uniqueAlumnos.some(a => a.id_alumno === calificacion.alumno.id_alumno)){
            uniqueAlumnos.push(calificacion.alumno);
        }
    });
    
    uniqueAlumnos.forEach((alumno) => {
        const row = [];
        row.push(`${alumno.apellido} ${alumno.nombre}`);

        tipos.forEach((tipo) => {
            const calificacion = calificaciones.find(c => c.alumno.id_alumno === alumno.id_alumno && c.tipoCalificacion.descripcion === tipo.label && c.fecha === tipo.fecha);
            row.push(calificacion ? calificacion.nota : "-");
        });
        mappedRows.push(row);
    });

    return mappedRows;
};

const getHeaders = (calificaciones) => {
    const tableColumnHeaders = ["Alumno"];
    const uniqueTipos = [];
    calificaciones.forEach((calificacion) => {
        if(!uniqueTipos.some(t => t.label === calificacion.tipoCalificacion.descripcion && t.fecha === calificacion.fecha)){
            uniqueTipos.push({ label: calificacion.tipoCalificacion.descripcion, fecha: calificacion.fecha });
        }
    });

    const orderedTipos = uniqueTipos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    orderedTipos.forEach((tipo) => {
        tableColumnHeaders.push(`${tipo.label} (${new Date(tipo.fecha).toLocaleDateString()})`);
    });

    return { tableColumnHeaders, uniqueTipos: orderedTipos };
}

export async function generarReportePDF({ curso = null, calificaciones = [], materia = null, alumno = null }) {
    const uniqueMaterias = [];
    calificaciones.forEach((calificacion) => {
        if(!uniqueMaterias.some(m => m.id_materia === calificacion.materia.id_materia)){
            uniqueMaterias.push({ id_materia: calificacion.materia.id_materia, nombre: calificacion.materia.nombre });
        }
    });

    const uniqueAnios = [];
    calificaciones.forEach((calificacion) => {
        if(!uniqueAnios.includes(calificacion.curso.cicloLectivo)){
            uniqueAnios.push(calificacion.curso.cicloLectivo);
        }
    });

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
        doc.text(`Curso: ${curso.name}`, 14, 40);

        let lastYIndex = 45;
        if(materia) {
            doc.text(`Materia: ${materia.nombre}`, 14, lastYIndex);
            lastYIndex += 5;
        }
        if(alumno) {
            doc.text(`Alumno: ${alumno.usuario.apellido} ${alumno.usuario.nombre}`, 14, lastYIndex)
            lastYIndex += 5;
        };

        // ——— Tabla de calificaciones ———
        const startY = lastYIndex;

        uniqueAnios.forEach((anio) => {
            // Título del ciclo
            doc.setFontSize(10);
            doc.text(`Ciclo lectivo ${anio}`, doc.internal.pageSize.getWidth() / 2, startY, { align: "center" });

            let currentY = startY + 10; // posición inicial debajo del título
            const filterRules = {materia: materia ? materia.id_materia : null, alumno: alumno ? alumno.id_alumno : null};

            if(materia){
                const filteredRows = calificaciones
                    .filter(c => c.curso.cicloLectivo === anio && 
                        (filterRules.materia ? c.materia.id_materia === filterRules.materia : true) &&
                        (filterRules.alumno ? c.alumno.id_alumno === filterRules.alumno : true)
                    )

                const { tableColumnHeaders, uniqueTipos } = getHeaders(filteredRows);

                const mappedRows = mapRows(filteredRows, uniqueTipos);
                
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
                uniqueMaterias.forEach((mat) => {
                    doc.setFontSize(11);
                    doc.text(`Materia: ${mat.nombre}`, 14, currentY);

                    const filteredRows = calificaciones
                        .filter(c => c.curso.cicloLectivo === anio && 
                            (c.materia.id_materia === mat.id_materia) &&
                            (filterRules.alumno ? c.alumno.id_alumno === filterRules.alumno : true)
                        );
                    const { tableColumnHeaders, uniqueTipos } = getHeaders(filteredRows);

                    const mappedRows = mapRows(filteredRows, uniqueTipos);

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

        // ——— Guardar PDF ———
        const fileNameParts = ["Reporte_Calificaciones"];
        if(curso) fileNameParts.push(`Curso_${curso.name}`);
        if(materia) fileNameParts.push(`Materia_${materia.nombre.replace(/\s+/g, "_")}`);
        if(alumno) fileNameParts.push(`Alumno_${alumno.usuario.apellido}_${alumno.usuario.nombre}`);
        const fileName = fileNameParts.join("_") + ".pdf";
        doc.save(fileName);
    }catch(error){
        console.error("Error generando reporte PDF de calificaciones:", error);
    }
}