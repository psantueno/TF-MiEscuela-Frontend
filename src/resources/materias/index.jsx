import React, { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
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
  TextInput,
  required,
  Show,
  SimpleShowLayout,
  useNotify,
  useRecordContext,
  ListButton,
  useGetOne,
  FunctionField,
} from 'react-admin';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Chip, List as MUIList, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { ArrowBack, InfoOutlined, FiberManualRecord } from '@mui/icons-material';

// Filtros de lista
const materiasFilters = [
  <TextInput key="f_nombre" label="Nombre" source="nombre" alwaysOn />,
  <TextInput key="f_desc" label="Descripción" source="descripcion" />,
];

// Acciones lista
const MateriasListActions = () => (
  <TopToolbar>
    <MateriasHelperButton />
    <FilterButton label="Filtrar por" />
    <CreateButton label="Crear" />
    <ExportButton label="Exportar" />
  </TopToolbar>
);

// BotÃ³n eliminar con confirmaciÃ³n
const DeleteMateriaButton = () => {
  const notify = useNotify();
  const record = useRecordContext();
  if (!record) return null;
  const disabled = !!record?.bloquear_borrado;
  const title = disabled ? 'No se puede eliminar: materia asignada a cursos' : 'Eliminar';
  return (
    <DeleteWithConfirmButton
      label="Borrar"
      confirmTitle="Confirmar eliminaciÃ³n"
      confirmContent={
        <Box sx={{ mt: 1 }}>
          <Typography>
            Vas a eliminar la materia <strong>{record?.nombre || 'sin nombre'}</strong>.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Esta acciÃ³n no se puede deshacer.
          </Typography>
        </Box>
      }
      size="small"
      sx={{ minWidth: 0, p: 0.25, ml: 1 }}
      disabled={disabled}
      title={title}
      mutationOptions={{
        onSuccess: () => notify('Materia eliminada correctamente', { type: 'success' }),
        onError: (e) => {
          const msg = e?.body?.error || e?.body?.message || e?.message || 'Error al eliminar materia';
          notify(msg, { type: 'warning' });
        },
      }}
    />
  );
};

const EditMateriaButton = () => {
  const record = useRecordContext();
  if (!record) return null;
  const disabled = !!record?.bloquear_edicion;
  const title = disabled ? 'No se puede editar: materia asignada a cursos activos' : 'Editar';
  return <EditButton label="Editar" disabled={disabled} title={title} />;
};

const MateriasHelperButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="small" onClick={() => setOpen(true)} sx={{ ml: 1 }} startIcon={<InfoOutlined />}>Información</Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle>Guía para la gestión de materias</DialogTitle>
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
            Tenga en cuenta que las materias se encuentran asociadas a cursos, los cuales pueden encontrarse cerrados (ciclos anteriores) o activos (cursos actuales del ciclo o en planeamiento). Por lo tanto, existen ciertas restricciones al momento de editar o eliminar materias:
          </Typography>
          <Box component="ul">
            <li>
              <Typography variant="body2">Primero cree las materias e indique el plan de estudios o resolución que los norma.</Typography>
            </li>
            <li>
              <Typography variant="body2">Una vez asignadas a cursos de ciclos en estado "Abierto" o "Planeamiento", la edición quedará restringida.</Typography>
            </li>
            <li>
              <Typography variant="body2">Si una materia está asignada al menos a un curso, no se puede eliminar.</Typography>
            </li>
            <li>
              <Typography variant="body2">Si la materia está asociada a cursos de ciclos cerrados, la edición quedará restringida.</Typography>
            </li>
            <li>
              <Typography variant="body2">Para habilitar la edición o borrado, primero debe deshacer las asignaciones a los cursos que correspondan.</Typography>
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

export const MateriasList = () => (
  <List
    resource="materias"
    title="Materias"
    filters={materiasFilters}
    perPage={25}
    sort={{ field: 'nombre', order: 'ASC' }}
    actions={<MateriasListActions />}
  >
    <Datagrid rowClick={(id) => `/materias/${id}/show`} bulkActionButtons={false}>
      <TextField source="nombre" label="Nombre" />
      <TextField source="descripcion" label="Descripción" />
      <FunctionField
        label="Estado"
        render={(record) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {record?.bloquear_edicion && (
              <Chip size="small" label="Asignada (activa)" color="warning" />
            )}
            {!record?.bloquear_edicion && record?.bloquear_borrado && (
              <Chip size="small" label="Asignada" />
            )}
            {record?.bloquear_nombre_historico && (
              <Chip size="small" label="Historial cerrado" color="info" />
            )}
          </Box>
        )}
      />
      <EditMateriaButton />
      <ShowButton label="Ver" />
      <DeleteMateriaButton />
    </Datagrid>
  </List>
);

const MateriasEditActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
    <ShowButton label="Ver" />
    <DeleteMateriaButton />
  </TopToolbar>
);

const MateriasCreateActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
  </TopToolbar>
);

const MateriasShowActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
    <EditMateriaButton />
  </TopToolbar>
);

const validateMateria = (values) => {
  const errors = {};
  if (!values?.nombre || String(values.nombre).trim() === '') {
    errors.nombre = 'El nombre es requerido';
  }
  return errors;
};

const MateriaFormFields = () => {
  const record = useRecordContext();
  const disableNombre = !!record?.bloquear_nombre_historico;
  return (
    <>
      <TextInput source="nombre" label="Nombre" validate={[required('El nombre es requerido')]} fullWidth disabled={disableNombre} />
      <TextInput source="descripcion" label="Descripción" fullWidth multiline minRows={2} />
    </>
  );
};

export const MateriasCreate = () => (
  <Create title="Crear materia" actions={<MateriasCreateActions />}>
    <SimpleForm sanitizeEmptyValues validate={validateMateria}>
      <MateriaFormFields />
    </SimpleForm>
  </Create>
);

export const MateriasEdit = () => (
  <Edit title="Editar materia" actions={<MateriasEditActions />}>
    <SimpleForm sanitizeEmptyValues validate={validateMateria}>
      <MateriaBlockAlerts />
      <MateriaFormFields />
    </SimpleForm>
  </Edit>
);

export const MateriasShow = () => (
  <Show title="Ver materia" actions={<MateriasShowActions />}>
    <SimpleShowLayout>
      <TextField source="id_materia" label="ID" />
      <TextField source="nombre" label="Nombre" />
      <TextField source="descripcion" label="Descripción" />
    </SimpleShowLayout>
  </Show>
);

const MateriaBlockAlerts = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Box sx={{ mb: 2, display: 'grid', gap: 1 }}>
      {!!record.bloquear_edicion && (
        <Alert severity="warning">Esta materia está asignada a cursos activos. Algunas acciones de ediciónn pueden estar limitadas.</Alert>
      )}
      {!!record.bloquear_borrado && (
        <Alert severity="info">La materia tiene asignaciones a cursos. Para eliminarla, primero debe deshacer esas asociaciones.</Alert>
      )}
      {!!record.bloquear_nombre_historico && (
        <Alert severity="info">La materia tiene historial en ciclos cerrados. El nombre no puede modificarse.</Alert>
      )}
    </Box>
  );
};




