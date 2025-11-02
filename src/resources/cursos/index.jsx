import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  FunctionField,
  EditButton,
  ShowButton,
  DeleteWithConfirmButton,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  Create,
  Edit,
  SimpleForm,
  NumberInput,
  TextInput,
  ReferenceInput,
  SelectInput,
  required,
  Show,
  SimpleShowLayout,
  useNotify,
  useRecordContext,
  useGetOne,
  useListContext,
  Toolbar,
  SaveButton,
  ListButton,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
import { Box, Typography, Button, Alert, Grid } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';


// Helper: ciclo cerrado
const isCicloCerrado = (estado) => String(estado || '').toLowerCase() === 'cerrado';

// Filtros de lista
const cursosFilters = [
  <NumberInput key="f_anio" label="Año escolar" source="anio_escolar" alwaysOn />,
  <TextInput key="f_division" label="División" source="division" />,
  <ReferenceInput key="f_ciclo" label="Ciclo lectivo" source="id_ciclo" reference="ciclos-lectivos">
    <SelectInput optionText="anio" />
  </ReferenceInput>,
];

const validateCurso = (values) => {
  const errors = {};
  const anio = Number(values.anio_escolar);
  if (values.anio_escolar === undefined || values.anio_escolar === null || values.anio_escolar === '') {
    errors.anio_escolar = 'El año escolar es requerido';
  } else if (!Number.isInteger(anio)) {
    errors.anio_escolar = 'El año escolar debe ser un número entero';
  } else if (anio < 1 || anio > 7) {
    errors.anio_escolar = 'El año escolar debe estar entre 1 y 7';
  }

  if (values.id_ciclo === undefined || values.id_ciclo === null || values.id_ciclo === '') {
    errors.id_ciclo = 'El ciclo lectivo es requerido';
  }

  return errors;
};

// Acciones de lista
const CursosListActions = () => {
  const navigate = useNavigate();
  return (
    <TopToolbar>
      <FilterButton label="Filtrar por" />
      <CreateCursoButton />
      <ExportButton label="Exportar" />
    </TopToolbar>
  );
};

const DeleteCursoButton = () => {
  const notify = useNotify();
  const record = useRecordContext();
  if (!record) return null;
  const { data: ciclo, isLoading } = useGetOne('ciclos-lectivos', { id: record.id_ciclo }, { enabled: !!record.id_ciclo });
  const cicloCerrado = !isLoading && ciclo?.estado === 'Cerrado';
  const title = cicloCerrado ? 'No se puede eliminar: ciclo cerrado' : 'Eliminar';
  return (
    <DeleteWithConfirmButton
      label="Borrar"
      confirmTitle="Confirmar eliminación"
      confirmContent={
        <Box sx={{ mt: 1 }}>
          <Typography>
            Vas a eliminar el curso <strong>{record?.anio_escolar}{record?.division ? ` ${record.division}` : ''}</strong>.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </Box>
      }
      size="small"
      sx={{ minWidth: 0, p: 0.25, ml: 1 }}
      disabled={cicloCerrado}
      title={title}
      mutationOptions={{
        onSuccess: () => notify('Curso eliminado correctamente', { type: 'success' }),
        onError: (e) => {
          let msg = e?.body?.error || e?.body?.message || e?.message || 'Error al eliminar curso';
          if (e?.status === 409 && !e?.body?.error) {
            msg = 'No se puede eliminar el curso: tiene registros asociados o el ciclo está cerrado';
          }
          notify(msg, { type: 'warning' });
        },
      }}
    />
  );
};

const EditCursoButton = () => {
  const record = useRecordContext();
  if (!record) return null;
  const { data: ciclo, isLoading } = useGetOne('ciclos-lectivos', { id: record.id_ciclo }, { enabled: !!record.id_ciclo });
  const disabled = !isLoading && ciclo?.estado === 'Cerrado';
  const title = disabled ? 'No se puede editar: ciclo cerrado' : 'Editar';
  return <EditButton label="Editar" disabled={disabled} title={title} />;
};

export const CursosList = () => (
  <List
    title="Cursos"
    actions={<CursosListActions />}
    filters={cursosFilters}
    perPage={25}
    sort={{ field: 'anio_escolar', order: 'ASC' }}
  >
    <Datagrid
      rowClick="show"
      sx={{
        '& .RaDatagrid-headerCell': { textAlign: 'center' },
        '& .RaDatagrid-rowCell': { textAlign: 'center' },
        '& .MuiTableCell-root': { textAlign: 'center' },
      }}
    >
      <NumberField source="anio_escolar" label="Año" />
      <TextField source="division" label="División" />
      <FunctionField label="Ciclo lectivo" render={(r) => r?.cicloLectivo?.anio ?? r?.id_ciclo} />
      <EditCursoButton />
      <ShowButton label="Ver" />
      <DeleteCursoButton />
    </Datagrid>
  </List>
);

const FormFields = () => (
  <>
    <Grid container rowSpacing={1} columnSpacing={3}>
      <Grid size={{ xs: 12, md: 3 }}>
        <NumberInput
          source="anio_escolar"
          label="Año escolar"
          validate={[required()]}
          fullWidth
          variant="outlined"
          size="small"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextInput
          source="division"
          label="División"
          fullWidth
          variant="outlined"
          size="small"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ReferenceInput source="id_ciclo" reference="ciclos-lectivos" label="Ciclo lectivo" perPage={100}>
          <SelectInput optionText="anio" validate={[required()]} variant="outlined" size="small" fullWidth />
        </ReferenceInput>
      </Grid>
    </Grid>
  </>
);

export const CursosCreate = () => {
  const notify = useNotify();
  const location = useLocation();
  const defaultValues = location.state?.record ? location.state.record : undefined;
  return (
    <Create
      title="Crear curso"
      actions={<CursosCreateActions />}
      transform={(data) => ({
        ...data,
        anio_escolar: Number(data.anio_escolar),
        id_ciclo: Number(data.id_ciclo),
      })}
      mutationOptions={{
        onSuccess: () => notify('Curso creado correctamente', { type: 'success' }),
        onError: (e) => {
          let msg = e?.message || e?.body?.message || 'Error al crear curso';
          if (e?.status === 409 || /unique|duplicad/i.test(String(msg))) {
            msg = 'Ya existe un curso para ese año/división en el ciclo seleccionado';
          }
          notify(msg, { type: 'warning' });
        },
      }}
    >
      <CursoCreateForm defaultValues={defaultValues} />
    </Create>
  );
};

export const CursosEdit = () => {
  const notify = useNotify();
  const record = useRecordContext();
  // Nota: en Edit, el record aún no está disponible en el primer render.
  return (
    <Edit
      title="Editar curso"
      actions={<CursosEditActions />}
      transform={(data) => ({
        ...data,
        ...(data.anio_escolar !== undefined ? { anio_escolar: Number(data.anio_escolar) } : {}),
        ...(data.id_ciclo !== undefined ? { id_ciclo: Number(data.id_ciclo) } : {}),
      })}
      mutationOptions={{
        onSuccess: () => notify('Curso actualizado correctamente', { type: 'success' }),
        onError: (e) => {
          let msg = e?.message || e?.body?.message || 'Error al actualizar curso';
          if (e?.status === 409 || /unique|duplicad/i.test(String(msg))) {
            msg = 'Ya existe un curso para ese año/división en el ciclo seleccionado';
          }
          notify(msg, { type: 'warning' });
        },
      }}
    >
      <CursoEditForm />
    </Edit>
  );
};

const CreateCursoButton = () => {
  const navigate = useNavigate();
  const { filterValues } = useListContext();
  const selectedCicloId = filterValues?.id_ciclo ? Number(filterValues.id_ciclo) : undefined;
  const { data: ciclo, isLoading } = useGetOne('ciclos-lectivos', { id: selectedCicloId }, { enabled: !!selectedCicloId });
  const estado = ciclo?.estado;
  const notAllowed = !!selectedCicloId && !isLoading && isCicloCerrado(estado);
  const title = notAllowed ? 'No se puede crear: ciclo cerrado' : 'Crear';

  const handleClick = () => {
    if (notAllowed) return;
    if (selectedCicloId) {
      navigate('/cursos/create', { state: { record: { id_ciclo: selectedCicloId } } });
    } else {
      navigate('/cursos/create');
    }
  };

  return (
    <Button onClick={handleClick} size="small" disabled={notAllowed} title={title} sx={{ ml: 1 }}>
      + Crear
    </Button>
  );
};

const CursoCreateToolbar = () => {
  const idCiclo = useWatch({ name: 'id_ciclo' });
  const cicloIdNum = idCiclo != null ? Number(idCiclo) : undefined;
  const { data: ciclo } = useGetOne('ciclos-lectivos', { id: cicloIdNum }, { enabled: !!cicloIdNum });
  const estado = ciclo?.estado;
  const block = !!cicloIdNum && isCicloCerrado(estado);
  return (
    <Toolbar>
      <SaveButton label="Guardar" disabled={block} />
    </Toolbar>
  );
};

const CursoCreateGuard = () => {
  const idCiclo = useWatch({ name: 'id_ciclo' });
  const cicloIdNum = idCiclo != null ? Number(idCiclo) : undefined;
  const { data: ciclo } = useGetOne('ciclos-lectivos', { id: cicloIdNum }, { enabled: !!cicloIdNum });
  const estado = ciclo?.estado;
  const block = !!cicloIdNum && isCicloCerrado(estado);
  if (!block) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="warning">No se pueden crear cursos en ciclos cerrados.</Alert>
    </Box>
  );
};

const CursoCreateForm = ({ defaultValues }) => {
  return (
    <SimpleForm
      sanitizeEmptyValues
      defaultValues={defaultValues}
      validate={validateCurso}
      toolbar={<CursoCreateToolbar />}
    >
      <CursoCreateGuard />
      <FormFields />
    </SimpleForm>
  );
};

const CursoEditForm = () => {
  const record = useRecordContext();
  const { data: ciclo } = useGetOne('ciclos-lectivos', { id: record?.id_ciclo }, { enabled: !!record?.id_ciclo });
  const cicloCerrado = ciclo?.estado === 'Cerrado';
  return (
    <SimpleForm
      sanitizeEmptyValues
      validate={validateCurso}
      toolbar={
        <Toolbar>
          <SaveButton label="Guardar" disabled={cicloCerrado} />
        </Toolbar>
      }
    >
      {cicloCerrado && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">Este curso pertenece a un ciclo cerrado. No se puede editar.</Alert>
        </Box>
      )}
      <FormFields />
    </SimpleForm>
  );
};

// Acciones superiores del Edit/Create (volver)
const CursosEditActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
    <ShowButton label="Ver" />
    <DeleteCursoButton />
  </TopToolbar>
);

const CursosCreateActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
  </TopToolbar>
);

const CursosShowActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
    <EditButton label="Editar" />
  </TopToolbar>
);

export const CursosShow = () => (
  <Show title="Ver curso" actions={<CursosShowActions />}>
    <SimpleShowLayout>
      <TextField source="id_curso" label="ID" />
      <NumberField source="anio_escolar" label="Año escolar" />
      <TextField source="division" label="División" />
      <FunctionField label="Ciclo lectivo" render={(r) => r?.cicloLectivo?.anio ?? r?.id_ciclo} />
    </SimpleShowLayout>
  </Show>
);
