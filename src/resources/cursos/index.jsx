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
  TabbedForm,
  NumberInput,
  TextInput,
  ReferenceInput,
  SelectInput,
  ReferenceArrayInput,
  SelectArrayInput,
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
import { Box, Typography, Button, Alert, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { InfoOutlined, FiberManualRecord } from '@mui/icons-material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';


// Helper: ciclo cerrado
const isCicloCerrado = (estado) => String(estado || '').toLowerCase() === 'cerrado';

// Filtros de lista
const cursosFilters = [
  <NumberInput key="f_anio" label="Año escolar" source="anio_escolar" alwaysOn />,
  <TextInput key="f_division" label="División" source="division" />,
  <ReferenceInput
    key="f_ciclo"
    label="Ciclo lectivo (solo planeamiento)"
    source="id_ciclo"
    reference="ciclos-lectivos"
    filter={{ estado: 'Planeamiento' }}
  >
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
      <CursosHelperButton />
      <FilterButton label="Filtrar por" />
      <CreateCursoButton />
      <ExportButton label="Exportar" />
    </TopToolbar>
  );
};

// Botón de información (estilo similar a Materias)
const CursosHelperButton = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="small" onClick={() => setOpen(true)} sx={{ ml: 1 }} startIcon={<InfoOutlined />}>Información</Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle>Guía para la gestión de cursos</DialogTitle>
        <DialogContent
          dividers
          sx={{
            '& p': { mb: 1.25, lineHeight: 1.6 },
            '& ul': { pl: 3, m: 0, listStylePosition: 'outside' },
            '& li': { mb: 0.75 },
            '& li .MuiTypography-root': { m: 0 },
          }}
        >
          <Typography gutterBottom>
            Las operaciones de edición y eliminación sobre cursos se rigen por el estado del ciclo lectivo al que pertenecen.
          </Typography>
          <Box component="ul">
            <li>
              <Typography variant="body2">Solo se pueden editar o eliminar cursos cuando el ciclo está en estado <strong>Planeamiento</strong>.</Typography>
            </li>
            <li>
              <Typography variant="body2">La asignación de materias al curso también es editable únicamente en <strong>Planeamiento</strong>.</Typography>
            </li>
            <li>
              <Typography variant="body2">Cuando el ciclo no está en Planeamiento (por ejemplo, Abierto o Cerrado), los botones de edición y borrado aparecerán deshabilitados.</Typography>
            </li>
            <li>
              <Typography variant="body2">Ante intentos de actualización no permitidos, el sistema devolverá un error que indica que el ciclo no permite modificaciones.</Typography>
            </li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Entendido</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const DeleteCursoButton = () => {
  const notify = useNotify();
  const record = useRecordContext();
  if (!record) return null;
  const blocked = !!record?.bloquear_edicion;
  const title = blocked ? 'No se puede eliminar: fuera de planeamiento' : 'Eliminar';
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
      disabled={blocked}
      title={title}
      mutationOptions={{
        onSuccess: () => notify('Curso eliminado correctamente', { type: 'success' }),
        onError: (e) => {
          let msg = e?.body?.error || e?.body?.message || e?.message || 'Error al eliminar curso';
          if (e?.status === 409 && !e?.body?.error) {
            msg = 'No se puede eliminar el curso: tiene registros asociados o el ciclo no permite modificaciones';
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
  const disabled = !!record?.bloquear_edicion;
  const title = disabled ? 'No se puede editar: fuera de planeamiento' : 'Editar y/o asignar materias';
  return <EditButton label="Editar / Asignar materias" disabled={disabled} title={title} />;
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
      <FunctionField
        label="Estado"
        render={(r) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {r?.bloquear_edicion ? (
              <Chip size="small" label="Bloqueado" color="warning" />
            ) : (
              <Chip size="small" label="Editable" color="success" />
            )}
          </Box>
        )}
      />
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
      mutationMode="pessimistic"
      transform={(data) => ({
        ...(console.log('[EDIT transform] cursos', { id: data?.id ?? data?.id_curso, keys: Object.keys(data || {}) }), {}),
        ...data,
        ...(data.anio_escolar !== undefined ? { anio_escolar: Number(data.anio_escolar) } : {}),
        ...(data.id_ciclo !== undefined ? { id_ciclo: Number(data.id_ciclo) } : {}),
      })}
      mutationOptions={{
        onSuccess: () => notify('Curso actualizado correctamente', { type: 'success' }),
        onError: (e) => {
          let msg = e?.body?.message || e?.message || 'Error al actualizar curso';
          const lower = String(msg).toLowerCase();
          if (e?.status === 409 && /no permite|planeamient/.test(lower)) {
            msg = 'El ciclo no permite modificaciones. Solo se puede editar en Planeamiento.';
          } else if (e?.status === 409 || /unique|duplicad/.test(lower)) {
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
  const blocked = !!record?.bloquear_edicion;
  return (
    <TabbedForm
      sanitizeEmptyValues
      validate={validateCurso}
      toolbar={
        <Toolbar>
          <SaveButton label="Guardar" disabled={blocked} alwaysEnable />
        </Toolbar>
      }
    >
      <TabbedForm.Tab label="Edición">
      {blocked && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">Este curso pertenece a un ciclo que no está en Planeamiento. No se puede editar.</Alert>
        </Box>
      )}
      <FormFields />

      </TabbedForm.Tab>
      <TabbedForm.Tab label="Materias">
      {blocked ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          La asignación de materias está bloqueada porque el ciclo se encuentra abierto. Puede acceder al botón "INFORMACIÓN" para más detalles.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Seleccioná las materias que se van a dictar en este curso.
        </Alert>
      )}
      <Box sx={{ mt: 2 }}>
        <ReferenceArrayInput
          label="Materias del curso"
          source="materiaIds"
          reference="materias"
          perPage={1000}
          parse={(value) => (Array.isArray(value) ? value.map((v) => Number(v)) : [])}
          format={(value) => (Array.isArray(value) ? value : [])}
          disabled={blocked}
        >
          <SelectArrayInput optionText="nombre" optionValue="id" fullWidth />
        </ReferenceArrayInput>
      </Box>
      </TabbedForm.Tab>
    </TabbedForm>
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
