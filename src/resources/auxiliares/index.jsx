import { 
    List,
    Datagrid,
    Create,
    Edit,
    Show,
    ReferenceInput,
    AutocompleteInput,
    TextInput,
    TopToolbar,
    CreateButton,
    ExportButton,
    FunctionField,
    TextField,
    EditButton,
    required,
    DateInput,
    useRecordContext,
    SimpleForm,
    useNotify,
    Toolbar,
    SaveButton,
    SelectInput,
    SimpleShowLayout,
    useDataProvider,
    DeleteWithConfirmButton,
} from "react-admin";
import { ArrowBack } from "@mui/icons-material";
import { Box, Alert, Typography, Button, Chip } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import React from "react";

const filters = [
    (
        <ReferenceInput key="f_id_auxiliar" source="id_auxiliar" reference="auxiliares" allowEmpty alwaysOn>
            <AutocompleteInput
                label="Auxiliar"
                optionText={(r) => (r ? `${r.usuario.apellido || ''}, ${r.usuario.nombre || ''}${r.usuario.numero_documento ? ` (${r.usuario.numero_documento})` : ''}` : '')}
                fullWidth
            />
        </ReferenceInput>
    ),
    (
        <TextInput
            key="f_dni"
            source="auxiliar_numero_documento"
            label="DNI"
            alwaysOn
            resettable
        />
    ),
];

const ListActions = () => (
    <TopToolbar>
        <CreateButton label="Crear designación" />
        <ExportButton label="Exportar" />
    </TopToolbar>
)

const CustomListButton = () => {
    const navigate = useNavigate();
    return (
        <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/gestion-academica/designar-cargos/auxiliares')}
        >
            Volver al listado
        </Button>
    );
};


const BackActions = () => (
    <TopToolbar>
        <CustomListButton />
    </TopToolbar>
)

const DeleteAsignacionButton = () => {
    const notify = useNotify();
    const record = useRecordContext();
    if (!record) return null;
    return (
        <DeleteWithConfirmButton
            label="Finalizar"
            confirmTitle="Confirmar finalización"
            confirmContent={
                <Box sx={{ mt: 1 }}>
                <Typography>
                    Vas a finalizar la asignación del docente <strong>{record?.id_docente}</strong> en el curso <strong>{record?.id_curso}</strong>.
                </Typography>
                </Box>
            }
            size="small"
            sx={{ minWidth: 0, p: 0.25, ml: 1 }}
            mutationOptions={{
                onSuccess: () => notify('Asignación finalizada correctamente', { type: 'success' }),
                onError: (e) => {
                const msg = e?.body?.error || e?.body?.message || e?.message || 'Error al eliminar asignación';
                notify(msg, { type: 'warning' });
                },
            }}
        />
    );
};

export const AuxiliaresList = () => (
    <List
        resource="auxiliares-curso"
        title="Asignaciones de auxiliares a cursos"
        filters={filters}
        perPage={25}
        actions={<ListActions />}
    >
        <Datagrid rowClick={(id) => `/auxiliares-curso/${id}/show`} bulkActionButtons={false}>
            <FunctionField
                label="Auxiliar"
                render={record => `${record.apellido}, ${record.nombre}`}
            />
            <TextField source="numero_documento" label="DNI N°" />
            <FunctionField
                label="Curso"
                render={record =>
                    `${record.curso.anio_escolar || ''}° ${record.curso.division || ''}`
                }
            />
            <FunctionField
                label="Ciclo lectivo"
                render={record =>
                    `${record.curso.ciclo_lectivo}`
                }
            />
            <TextField source="rol" label="Rol" />
            <FunctionField 
                label="Estado"
                render={record => 
                    <Chip 
                        label={record.fecha_fin ? 'Finalizado' : 'Activo'} 
                        sx={{ 
                            bgcolor: (theme) => record.fecha_fin ? theme.palette.error.light : theme.palette.info.light, 
                            color: (theme) => theme.palette.info.contrastText,
                            opacity: 0.85,
                        }} 
                    />
                }
            />
            <EditButton 
                label="Editar"
                size="small"
                sx={{ minWidth: 0, p: 0.25, width: 60, justifyContent: 'center' }}
            />
            <FunctionField label="" render={record => !record.fecha_fin &&
                <DeleteAsignacionButton />
            } />
        </Datagrid>
    </List>
);

const AuxiliarNombre = () => {
    const record = useRecordContext();
    if (!record) return null;
    record.nombre_completo = `${record.nombre} ${record.apellido}`;

    return (
        <TextInput
            label="Auxiliar"
            source="nombre_completo"
            value={`${record.nombre} ${record.apellido}`}
            disabled
            fullWidth
        />
    );
};

const CursoDescripcion = () => {
    const record = useRecordContext();
    if (!record?.curso) return null;
    record.curso_descripcion = `${record.curso.anio_escolar}°${record.curso.division} (${record.curso.ciclo_lectivo})`;
    return (
        <TextInput
            label="Curso"
            source="curso_descripcion"
            value={record.curso_descripcion}
            disabled
            fullWidth
        />
    );
};

const EditAsignacionFields = () => (
    <>
        <AuxiliarNombre />

        <CursoDescripcion />

        <SelectInput
            source="rol"
            label="Rol"
            choices={[
                { id: 'Titular', name: 'Titular' },
                { id: 'Interino', name: 'Interino' },
                { id: 'Suplente', name: 'Suplente' },
            ]}
            fullWidth
        />
        <DateInput source="fecha_inicio" label="Fecha inicio" fullWidth />
        <DateInput source="fecha_fin" label="Fecha fin" fullWidth />
    </>
);

const AsignacionToolbar = ({ disabled }) => {
    const notify = useNotify();
    return (
        <Toolbar>
            <SaveButton
                label="Guardar"
                disabled={disabled}
                alwaysEnable
                mutationOptions={{
                onSuccess: () => notify('Asignación actualizada correctamente', { type: 'success' }),
                onError: (e) => {
                    const message = e?.message || 'Error al actualizar la asignación';
                    notify(message, { type: 'warning' });
                },
                }}
            />
        </Toolbar>
    );
};

const EditAsignacionForm = () => {
    const record = useRecordContext();

    return (
        <SimpleForm sanitizeEmptyValues toolbar={<AsignacionToolbar />}>
            <EditAsignacionFields />
        </SimpleForm>
    );
};

export const AuxiliaresEdit = () => (
    <Edit title="Editar asignación" actions={<BackActions />} mutationMode="pessimistic" redirect="/gestion-academica/designar-cargos/auxiliares">
        <EditAsignacionForm />
    </Edit>
);

const EditActions = () => (
    <TopToolbar sx={{ display:'flex', justifyContent:'end', alignItems:'center' }}>
        <EditButton label="Editar" />
        <CustomListButton />
    </TopToolbar>
)

export const AuxiliaresShow = () => (
    <Show title="Detalle de asignación" actions={<EditActions />}>
        <SimpleShowLayout>
            <FunctionField
                label="Auxiliar"
                render={record => `${record.apellido}, ${record.nombre}`}
            />
            <TextField source="numero_documento" label="DNI N°" />
            <FunctionField
                label="Curso"
                render={record =>
                    `${record.curso.anio_escolar || ''}° ${record.curso.division || ''} (${record.curso.ciclo_lectivo})`
                }
            />
            <TextField source="rol" label="Rol" />
            <TextField source="fecha_inicio" label="Fecha inicio" />
            <TextField source="fecha_fin" label="Fecha fin" />
        </SimpleShowLayout>
    </Show>
)

const CreateAsignacionFields = () => {
    const { setValue, clearErrors } = useFormContext();
    const dataProvider = useDataProvider();
    const idCiclo = useWatch({ name: 'id_ciclo' });
    const cicloIdNum = idCiclo != null && idCiclo !== '' ? Number(idCiclo) : undefined;
    const [isCicloSelected, setIsCicloSelected] = React.useState(false);
    const [loadingCursos, setLoadingCursos] = React.useState(false);
    const [cursos, setCursos] = React.useState([]);

    React.useEffect(() => {
        setValue('id_curso', undefined, { shouldValidate: true, shouldDirty: true });
        clearErrors('id_curso');
        if (!cicloIdNum) {
            setIsCicloSelected(false);
            setLoadingCursos(false);
            return;
        }
        let active = true;
        setLoadingCursos(true);
        dataProvider
            .getCursosPorCiclo(cicloIdNum, { pagination: { page: 1, perPage: 50 }, sort: { }, filter: {} })
            .then(({  data }) => {
                if (!active) return;
                const count = Array.isArray(data) ? data.length : 0;
                setCursos(data || []);
                setIsCicloSelected(count > 0);
            })
            .catch(() => active && setIsCicloSelected(false))
            .finally(() => active && setLoadingCursos(false));
        return () => {
            active = false;
        };
    }, [cicloIdNum]);

    return(
        <>
            <ReferenceInput source="id_auxiliar" reference="auxiliares">
                <AutocompleteInput
                    label="Auxiliar"
                    validate={[required('El auxiliar es requerido')]}
                    parse={(v) => (v === '' || v == null ? undefined : Number(v))}
                    optionText={(r) => (r ? `${r.usuario.apellido || ''}, ${r.usuario.nombre || ''}${r.usuario.numero_documento ? ` (${r.usuario.numero_documento})` : ''}` : '')}
                    onChange={() => clearErrors('id_auxiliar')}
                    fullWidth
                />
            </ReferenceInput>

            <ReferenceInput
                source="id_ciclo"
                reference="ciclos-lectivos"
                filter={{ estado: 'Abierto,Planeamiento' }}
                perPage={100}
            >
                <AutocompleteInput label="Ciclo lectivo" optionText={(r) => (r?.anio || r?.ciclo_anio || '')} fullWidth />
            </ReferenceInput>
            {isCicloSelected && (
                <SelectInput
                    source="id_curso"
                    label="Curso"
                    validate={[required('El curso es requerido')]}
                    disabled={loadingCursos}
                    choices={cursos.map(c => ({
                        id: c.id_curso,
                        name: `${c.anio_escolar}° ${c.division}`
                    }))}
                    onChange={() => clearErrors('id_curso')}
                    fullWidth
                />
            )}

            <SelectInput
                source="rol"
                label="Rol"
                choices={[
                    { id: 'Titular', name: 'Titular' },
                    { id: 'Interino', name: 'Interino' },
                    { id: 'Suplente', name: 'Suplente' },
                ]}
                fullWidth
            />
            <DateInput source="fecha_inicio" label="Fecha inicio" fullWidth validate={[required('La fecha de inicio es requerida')]}/>
        </>
    )
}

const CreateAsignacionForm = () => {    
    return (
        <SimpleForm sanitizeEmptyValues toolbar={<AsignacionToolbar />}>
            <CreateAsignacionFields />
        </SimpleForm>
    );
};

export const AuxiliaresCreate = () => (
    <Create title="Crear asignación" actions={<BackActions />} mutationMode="pessimistic" redirect="/gestion-academica/designar-cargos/auxiliares">
        <CreateAsignacionForm />
    </Create>
);