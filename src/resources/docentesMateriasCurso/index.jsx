import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteWithConfirmButton,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  required,
  Show,
  SimpleShowLayout,
  ListButton,
  useNotify,
  useRecordContext,
  useGetOne,
  Toolbar,
  SaveButton,
  ReferenceField,
  ReferenceInput,
  AutocompleteInput,
  FunctionField,
  SelectInput,
  useDataProvider,
} from 'react-admin';
import { useWatch, useFormContext } from 'react-hook-form';
import { Box, Typography, Alert, Chip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

// Helper: ciclo cerrado
const isCicloCerrado = (estado) => String(estado || '').toLowerCase() === 'cerrado';

// Hook: dado un id_materia_curso, determina si el ciclo está cerrado
const useCicloCerradoPorMateriaCurso = (idMateriaCurso) => {
  const mcIdNum = idMateriaCurso != null ? Number(idMateriaCurso) : undefined;
  const { data: mc } = useGetOne('materias-curso', { id: mcIdNum }, { enabled: !!mcIdNum });
  const idCurso = mc?.id_curso != null ? Number(mc.id_curso) : undefined;
  const { data: curso } = useGetOne('cursos', { id: idCurso }, { enabled: !!idCurso });
  const idCiclo = curso?.id_ciclo != null ? Number(curso.id_ciclo) : undefined;
  const { data: ciclo } = useGetOne('ciclos-lectivos', { id: idCiclo }, { enabled: !!idCiclo });
  const estado = ciclo?.estado;
  return isCicloCerrado(estado);
};

// Filtros de lista (solo Docente y DNI)
const asignacionesFilters = [
  (
    <ReferenceInput key="f_id_docente" source="id_docente" reference="docentes" allowEmpty alwaysOn>
      <AutocompleteInput
        label="Docente"
        optionText={(r) => (r ? `${r.apellido || ''}, ${r.nombre || ''}${r.numero_documento ? ` (${r.numero_documento})` : ''}` : '')}
        fullWidth
      />
    </ReferenceInput>
  ),
  (
    <ReferenceInput
      key="f_id_ciclo"
      label="Ciclo lectivo"
      source="id_ciclo"
      reference="ciclos-lectivos"
      filter={{ estado: 'Abierto,Planeamiento' }}
      allowEmpty
    >
      <AutocompleteInput label="Ciclo lectivo" optionText={(r) => (r?.anio || r?.ciclo_anio || '')} fullWidth />
    </ReferenceInput>
  ),
  (
    <TextInput
      key="f_dni"
      source="docente_numero_documento"
      label="DNI"
      alwaysOn
      resettable
    />
  ),
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton label="Filtrar por" />
    <CreateButton label="Crear designación" />
    <ExportButton label="Exportar" />
  </TopToolbar>
);

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
            Vas a finalizar la asignación del docente <strong>{record?.id_docente}</strong> en la materia-curso <strong>{record?.id_materia_curso}</strong>.
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

export const DocentesMateriasCursoList = () => (
  <List
    resource="docentes-materias-curso"
    title="Asignaciones de docentes por materia"
    filters={asignacionesFilters}
    perPage={25}
    sort={{ field: 'fecha_inicio', order: 'DESC' }}
    actions={<ListActions />}
  >
    <Datagrid rowClick={(id) => `/docentes-materias-curso/${id}/show`} bulkActionButtons={false}>
      <ReferenceField label="Docente" source="id_docente" reference="docentes" link={false}>
        <FunctionField render={(r) => (r ? `${r.apellido || ''}, ${r.nombre || ''}` : '')} />
      </ReferenceField>
      <ReferenceField label="DNI N°" source="id_docente" reference="docentes" link={false}>
        <FunctionField render={(r) => (r?.numero_documento ?? '')} />
      </ReferenceField>
      <ReferenceField label="Materia" source="id_materia_curso" reference="materias-curso" link={false}>
        <FunctionField render={(r) => (r?.materia_nombre || '')} />
      </ReferenceField>
      <ReferenceField label="Curso" source="id_materia_curso" reference="materias-curso" link={false}>
        <FunctionField render={(r) => (r?.curso_label || `${r?.curso_anio_escolar || ''} ${r?.curso_division || ''}`)} />
      </ReferenceField>
      <ReferenceField label="Ciclo lectivo" source="id_materia_curso" reference="materias-curso" link={false}>
        <FunctionField render={(r) => (r?.ciclo_anio ?? '')} />
      </ReferenceField>
      <TextField source="rol_docente" label="Rol" />
      <DateField source="fecha_inicio" label="Fecha inicio" />
      <FunctionField label="Fecha fin" render={(r) => (
        r?.fecha_fin ? (
          <DateField record={r} source="fecha_fin" />
        ) : (
          <Chip
            label="Activo"
            size="small"
            color="info"
            variant="filled"
            sx={{
              bgcolor: (theme) => theme.palette.info.light,
              color: (theme) => theme.palette.info.contrastText,
              opacity: 0.85,
            }}
          />
        )
      )} />
      <EditButton label="" size="small" sx={{ minWidth: 0, p: 0.25, width: 36, justifyContent: 'center' }} />
      <DeleteAsignacionButton />
    </Datagrid>
  </List>
);

// Debug helpers removidos para limpiar consola en producción


const EditActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
  </TopToolbar>
);

const CreateActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
  </TopToolbar>
);

const validateAsignacion = (values) => {
  const errors = {};
  if (values.id_docente == null || values.id_docente === '') {
    errors.id_docente = 'El docente es requerido';
  }
  if (values.id_materia_curso == null || values.id_materia_curso === '') {
    errors.id_materia_curso = 'La materia-curso es requerida';
  }
  return errors;
};

const AsignacionFormFields = () => (
  <>
    <ReferenceInput source="id_docente" reference="docentes">
      <AutocompleteInput label="Docente" validate={[required()]} optionText={(r) => (r ? `${r.apellido || ''}, ${r.nombre || ''}${r.numero_documento ? ` (${r.numero_documento})` : ''}` : '')} fullWidth />
    </ReferenceInput>
    <ReferenceInput source="id_materia_curso" reference="materias-curso">
      <AutocompleteInput label="Materia / Curso" validate={[required()]} optionText={(r) => (r ? `${r.materia_nombre || ''} - ${r.curso_label || `${r.curso_anio_escolar || ''} ${r.curso_division || ''}`}` : '')} fullWidth />
    </ReferenceInput>
    <TextInput source="rol_docente" label="Rol docente" fullWidth />
    <DateInput source="fecha_inicio" label="Fecha inicio" fullWidth />
    <DateInput source="fecha_fin" label="Fecha fin" fullWidth />
  </>
);

export const DocentesMateriasCursoCreate = () => (
  <Create title="Crear asignación" actions={<CreateActions />} mutationMode="pessimistic">
    <CreateAsignacionForm />
  </Create>
);

export const DocentesMateriasCursoEdit = () => (
  <Edit title="Editar asignación" actions={<EditActions />} mutationMode="pessimistic">
    <EditAsignacionForm />
  </Edit>
);

export const DocentesMateriasCursoShow = () => (
  <Show title="Ver asignación">
    <SimpleShowLayout>
      <ReferenceField label="Docente" source="id_docente" reference="docentes" link={false}>
        <FunctionField render={(r) => (r ? `${r.apellido || ''}, ${r.nombre || ''}${r.numero_documento ? ` (${r.numero_documento})` : ''}` : '')} />
      </ReferenceField>
      <ReferenceField label="Materia / Curso" source="id_materia_curso" reference="materias-curso" link={false}>
        <FunctionField render={(r) => (r ? `${r.materia_nombre || ''} - ${r.curso_label || `${r.curso_anio_escolar || ''} ${r.curso_division || ''}`}` : '')} />
      </ReferenceField>
      <TextField source="rol_docente" label="Rol" />
      <DateField source="fecha_inicio" label="Fecha inicio" />
      <DateField source="fecha_fin" label="Fecha fin" />
    </SimpleShowLayout>
  </Show>
);

// Normalizador de errores de API -> mensaje y errores por campo
const normalizeApiError = (err) => {
  const body = err?.body || {};
  const fieldErrors = {};
  if (Array.isArray(body.errors)) {
    body.errors.forEach((e) => {
      if (e?.path) fieldErrors[e.path] = e?.message || 'Dato inválido';
    });
  }
  if (Array.isArray(body.details)) {
    body.details.forEach((d) => {
      if (d?.path) fieldErrors[d.path] = d?.message || 'Dato inválido';
    });
  }
  if (body?.validationErrors && typeof body.validationErrors === 'object') {
    Object.entries(body.validationErrors).forEach(([k, v]) => {
      fieldErrors[k] = typeof v === 'string' ? v : (v?.message || 'Dato inválido');
    });
  }
  const message = body?.error || body?.message || err?.message || 'Ocurrió un error';
  return { message, fieldErrors };
};

const AsignacionToolbar = ({ disabled }) => {
  const notify = useNotify();
  const { setError } = useFormContext();
  return (
    <Toolbar>
      <SaveButton
        label="Guardar"
        disabled={disabled}
        alwaysEnable
        mutationOptions={{
          onSuccess: () => notify('Asignación actualizada correctamente', { type: 'success' }),
          onError: (e) => {
            const { message, fieldErrors } = normalizeApiError(e);
            Object.entries(fieldErrors).forEach(([name, msg]) => setError(name, { type: 'server', message: msg }));
            notify(message, { type: 'warning' });
          },
        }}
      />
    </Toolbar>
  );
};

// Toolbar que calcula el bloqueo dentro del contexto del formulario (Create)
const AsignacionToolbarCreate = () => {
  const idMateriaCurso = useWatch({ name: 'id_materia_curso' });
  const bloqueado = useCicloCerradoPorMateriaCurso(idMateriaCurso);
  const notify = useNotify();
  const { setError } = useFormContext();
  return (
    <Toolbar>
      <SaveButton
        label="Guardar"
        disabled={bloqueado}
        alwaysEnable
        mutationOptions={{
          onSuccess: () => notify('Asignación creada correctamente', { type: 'success' }),
          onError: (e) => {
            const { message, fieldErrors } = normalizeApiError(e);
            Object.entries(fieldErrors).forEach(([name, msg]) => setError(name, { type: 'server', message: msg }));
            notify(message, { type: 'warning' });
          },
        }}
      />
    </Toolbar>
  );
};

// Alerta de bloqueo en Create, evaluada dentro del formulario
const BloqueoAlertCreate = () => {
  const idMateriaCurso = useWatch({ name: 'id_materia_curso' });
  const bloqueado = useCicloCerradoPorMateriaCurso(idMateriaCurso);
  if (!bloqueado) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="warning">No se pueden crear asignaciones en ciclos cerrados.</Alert>
    </Box>
  );
};

const CreateAsignacionForm = () => {
  return (
    <SimpleForm sanitizeEmptyValues toolbar={<AsignacionToolbarCreate />}>
      <BloqueoAlertCreate />
      <CreateAsignacionFields />
    </SimpleForm>
  );
};

// Campos del Create con dependencia Ciclo -> Curso -> Materia/Curso
const CreateAsignacionFields = () => {
  const { setValue, clearErrors } = useFormContext();
  const dataProvider = useDataProvider();
  const idCiclo = useWatch({ name: 'id_ciclo' });
  const cicloIdNum = idCiclo != null && idCiclo !== '' ? Number(idCiclo) : undefined;
  const [hasMcOptions, setHasMcOptions] = React.useState(false);
  const [loadingMc, setLoadingMc] = React.useState(false);

  React.useEffect(() => {
    setValue('id_materia_curso', undefined, { shouldValidate: true, shouldDirty: true });
    clearErrors('id_materia_curso');
    if (!cicloIdNum) {
      setHasMcOptions(false);
      setLoadingMc(false);
      return;
    }
    let active = true;
    setLoadingMc(true);
    dataProvider
      .getList('materias-curso', {
        pagination: { page: 1, perPage: 1 },
        sort: { field: 'id_materia_curso', order: 'ASC' },
        filter: { id_ciclo: cicloIdNum },
      })
      .then(({ total, data }) => {
        if (!active) return;
        const count = Array.isArray(data) ? data.length : 0;
        setHasMcOptions(count > 0);
      })
      .catch(() => active && setHasMcOptions(false))
      .finally(() => active && setLoadingMc(false));
    return () => {
      active = false;
    };
  }, [cicloIdNum]);

  return (
    <>
      <ReferenceInput source="id_docente" reference="docentes">
        <AutocompleteInput
          label="Docente"
          validate={[required('El docente es requerido')]}
          parse={(v) => (v === '' || v == null ? undefined : Number(v))}
          optionText={(r) => (r ? `${r.apellido || ''}, ${r.nombre || ''}${r.numero_documento ? ` (${r.numero_documento})` : ''}` : '')}
          onChange={() => clearErrors('id_docente')}
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

      {cicloIdNum && hasMcOptions && (
        <ReferenceInput
          source="id_materia_curso"
          reference="materias-curso"
          filter={{ id_ciclo: cicloIdNum }}
          perPage={300}
        >
          <AutocompleteInput
            validate={[required('La materia-curso es requerida')]}
            parse={(v) => (v === '' || v == null ? undefined : Number(v))}
            optionText={(r) => (r ? `${r.materia_nombre || ''} - ${r.curso_label || `${r.curso_anio_escolar || ''} ${r.curso_division || ''}`}` : '')}
            onChange={() => clearErrors('id_materia_curso')}
            label="Materia / Curso"
            fullWidth
          />
        </ReferenceInput>
      )}
      {cicloIdNum && !loadingMc && !hasMcOptions && (
        <Alert severity="info">No hay materias asignadas asociadas a cursos en este momento. Gestionelo en la pestaña cursos, usando el boton editar y seleccionando "materias".</Alert>
      )}

      <SelectInput
        source="rol_docente"
        label="Rol docente"
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
};

const EditAsignacionForm = () => {
  const record = useRecordContext();
  const idMateriaCurso = record?.id_materia_curso;
  const bloqueado = useCicloCerradoPorMateriaCurso(idMateriaCurso);
  return (
    <SimpleForm sanitizeEmptyValues toolbar={<AsignacionToolbar disabled={bloqueado} />}>
      {bloqueado && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">Este curso pertenece a un ciclo cerrado. No se puede editar.</Alert>
        </Box>
      )}
      <EditAsignacionFields />
    </SimpleForm>
  );
};

const EditAsignacionFields = () => (
  <>
    {/* Docente y Materia/Curso como inputs bloqueados; mantener IDs ocultos para garantizar envío */}
    <ReferenceInput source="id_docente" reference="docentes">
      <AutocompleteInput
        label="Docente"
        optionText={(r) => (r ? `${r.apellido || ''}, ${r.nombre || ''}${r.numero_documento ? ` (${r.numero_documento})` : ''}` : '')}
        disabled
        fullWidth
      />
    </ReferenceInput>
    <TextInput source="id_docente" sx={{ display: 'none' }} />

    <ReferenceInput source="id_materia_curso" reference="materias-curso">
      <AutocompleteInput
        label="Materia / Curso"
        optionText={(r) => (r ? `${r.materia_nombre || ''} - ${r.curso_label || `${r.curso_anio_escolar || ''} ${r.curso_division || ''}`}` : '')}
        disabled
        fullWidth
      />
    </ReferenceInput>
    <TextInput source="id_materia_curso" sx={{ display: 'none' }} />

    <SelectInput
      source="rol_docente"
      label="Rol docente"
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
