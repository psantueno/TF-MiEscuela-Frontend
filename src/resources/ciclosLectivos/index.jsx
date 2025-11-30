import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
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
  DateInput,
  SelectInput,
  required,
  Show,
  SimpleShowLayout,
  useNotify,
  useRecordContext,
  Toolbar,
  SaveButton,
  ListButton,
  FunctionField,
} from 'react-admin';
import { Box, Typography, Grid, Button, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EstadoChoices = [
  { id: 'Abierto', name: 'Abierto' },
  { id: 'Planeamiento', name: 'Planeamiento' },
  { id: 'Cerrado', name: 'Cerrado' },
];

// Filtros de lista
const ciclosFilters = [
  <NumberInput key="f_anio" label="Año" source="anio" alwaysOn />,
  <SelectInput key="f_estado" label="Estado" source="estado" choices={EstadoChoices} />,
];

// Validaciones
const isValidDate = (d) => {
  const t = new Date(d).getTime();
  return !Number.isNaN(t);
};

const validateCiclo = (values) => {
  const errors = {};
  const anio = Number(values.anio);
  if (values.anio === undefined || values.anio === null || values.anio === '') {
    errors.anio = 'El año es requerido';
  } else if (!Number.isInteger(anio)) {
    errors.anio = 'El año debe ser un número entero';
  } else if (anio < 2000 || anio > 2100) {
    errors.anio = 'El año debe estar entre 2000 y 2100';
  }

  if (!values.fecha_inicio) {
    errors.fecha_inicio = 'La fecha de inicio es requerida';
  } else if (!isValidDate(values.fecha_inicio)) {
    errors.fecha_inicio = 'Fecha de inicio inválida';
  }

  if (!values.fecha_fin) {
    errors.fecha_fin = 'La fecha de fin es requerida';
  } else if (!isValidDate(values.fecha_fin)) {
    errors.fecha_fin = 'Fecha de fin inválida';
  }

  if (isValidDate(values.fecha_inicio) && isValidDate(values.fecha_fin)) {
    if (new Date(values.fecha_fin) < new Date(values.fecha_inicio)) {
      errors.fecha_fin = 'La fecha de fin no puede ser anterior a la de inicio';
    }
  }

  if(isValidDate(values.inicio_primer_cuatrimestre) && isValidDate(values.cierre_primer_cuatrimestre)) {
    if (new Date(values.cierre_primer_cuatrimestre) < new Date(values.inicio_primer_cuatrimestre)) {
      errors.cierre_primer_cuatrimestre = 'La fecha de fin del primer cuatrimestre no puede ser anterior a la de inicio';
    }
  }

  if(isValidDate(values.inicio_segundo_cuatrimestre) && isValidDate(values.cierre_segundo_cuatrimestre)) {
    if (new Date(values.cierre_segundo_cuatrimestre) < new Date(values.inicio_segundo_cuatrimestre)) {
      errors.cierre_segundo_cuatrimestre = 'La fecha de fin del segundo cuatrimestre no puede ser anterior a la de inicio';
    }
  }

  if (values.estado && !EstadoChoices.some((c) => c.id === values.estado)) {
    errors.estado = 'Estado inválido';
  }

  return errors;
};

// Acciones de lista con estilo consistente
const CiclosListActions = () => {
  const navigate = useNavigate();
  return (
    <TopToolbar>
      <FilterButton label="Filtrar por" />
      <CreateButton label="Crear" />
      <ExportButton label="Exportar" />
    </TopToolbar>
  );
};

const DeleteCicloButton = () => {
  const notify = useNotify();
  const record = useRecordContext();
  if (!record) return null;
  const cerrado = record?.estado === 'Cerrado';
  const title = cerrado ? 'No se puede eliminar: ciclo cerrado' : 'Eliminar';

  return (
    <DeleteWithConfirmButton
      label="Borrar"
      confirmTitle="Confirmar eliminación"
      confirmContent={
        <Box sx={{ mt: 1 }}>
          <Typography>
            Vas a eliminar el ciclo lectivo <strong>{record?.anio}</strong>.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </Box>
      }
      size="small"
      sx={{ minWidth: 0, p: 0.25, ml: 1 }}
      disabled={cerrado}
      title={title}
      mutationOptions={{
        onSuccess: () => notify('Ciclo lectivo eliminado correctamente', { type: 'success' }),
        onError: (e) => {
          let msg = e?.body?.error || e?.body?.message || e?.message || 'Error al eliminar ciclo lectivo';
          if (e?.status === 409 && !e?.body?.error) {
            msg = 'No se puede eliminar: tiene registros asociados o está cerrado';
          }
          notify(msg, { type: 'warning' });
        },
      }}
    />
  );
};

export const CiclosLectivosList = () => (
  <List title="Ciclos lectivos" actions={<CiclosListActions />} filters={ciclosFilters} perPage={25}>
    <Datagrid rowClick="show">
      <TextField source="anio" label="Año" />
      <DateField source="fecha_inicio" label="Fecha inicio" showTime={false} />
      <DateField source="fecha_fin" label="Fecha fin" showTime={false} />
      <TextField source="estado" label="Estado" />
      <EditCicloButton />
      <ShowButton label="Ver" />
      <DeleteCicloButton />
    </Datagrid>
  </List>
);

const EditCicloButton = () => {
  const record = useRecordContext();
  if (!record) return null;
  const disabled = record?.estado === 'Cerrado';
  const title = disabled ? 'No se puede editar: ciclo cerrado' : 'Editar';
  return <EditButton label="Editar" disabled={disabled} title={title} />;
};

const FormFields = ({ disabled = false }) => (
  <>
    <Grid container rowSpacing={1} columnSpacing={3}>
      <Grid size={{ xs: 12, md: 3 }}>
        <NumberInput source="anio" label="Año" validate={[required()]} fullWidth disabled={disabled} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <DateInput source="fecha_inicio" label="Fecha inicio" validate={[required()]} fullWidth disabled={disabled} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <DateInput source="fecha_fin" label="Fecha fin" validate={[required()]} fullWidth disabled={disabled} />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <SelectInput source="estado" label="Estado" choices={EstadoChoices} disabled={disabled} />
      </Grid>
    </Grid>
    <Grid container sx={{ mt: 2, gap: 1 }}>
      <Grid size={{ xs: 12, md: 5 }}>
        <DateInput source="inicio_primer_cuatrimestre" label="Inicio primer cuatrimestre" validate={[required()]} fullWidth disabled={disabled} />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <DateInput source="cierre_primer_cuatrimestre" label="Fin primer cuatrimestre" validate={[required()]} fullWidth disabled={disabled} />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <DateInput source="inicio_segundo_cuatrimestre" label="Inicio segundo cuatrimestre" validate={[required()]} fullWidth disabled={disabled} />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <DateInput source="cierre_segundo_cuatrimestre" label="Fin segundo cuatrimestre" validate={[required()]} fullWidth disabled={disabled} />
      </Grid>
    </Grid>
  </>
);

export const CiclosLectivosCreate = () => {
  const notify = useNotify();
  return (
    <Create
      title="Crear ciclo lectivo"
      actions={<CiclosCreateActions />}
      transform={(data) => ({ ...data, anio: Number(data.anio) })}
      mutationOptions={{
        onSuccess: () => notify('Ciclo lectivo creado correctamente', { type: 'success' }),
        onError: (e) => {
          let msg = e?.message || e?.body?.message || 'Error al crear ciclo lectivo';
          if (e?.status === 409 || /unique|duplicad/i.test(String(msg))) {
            msg = 'Ya existe un ciclo para ese año';
          }
          notify(msg, { type: 'warning' });
        },
      }}
    >
      <SimpleForm sanitizeEmptyValues validate={validateCiclo} toolbar={<Toolbar><SaveButton label="Guardar" /></Toolbar>}>
        <FormFields />
      </SimpleForm>
    </Create>
  );
};

export const CiclosLectivosEdit = () => {
  const notify = useNotify();
  return (
    <Edit
      title="Editar ciclo lectivo"
      mutationMode="pessimistic"
      transform={(data) => ({ ...data, anio: Number(data.anio) })}
      actions={<CiclosEditActions />}
      mutationOptions={{
        onSuccess: () => notify('Ciclo lectivo actualizado correctamente', { type: 'success' }),
        onError: (e) => {
          let msg = e?.message || e?.body?.message || 'Error al actualizar ciclo lectivo';
          if (e?.status === 409 || /unique|duplicad/i.test(String(msg))) {
            msg = 'Ya existe un ciclo para ese año';
          }
          notify(msg, { type: 'warning' });
        },
      }}
    >
      <CicloEditForm />
    </Edit>
  );
};

const CicloEditForm = () => {
  const record = useRecordContext();
  const cerrado = record?.estado === 'Cerrado';
  return (
    <SimpleForm
      sanitizeEmptyValues
      validate={validateCiclo}
      toolbar={
        <Toolbar>
          <SaveButton label="Guardar" disabled={cerrado} />
        </Toolbar>
      }
    >
      {cerrado && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">Este ciclo está en estado "Cerrado". No se puede editar.</Alert>
        </Box>
      )}
      <FormFields disabled={cerrado} />
    </SimpleForm>
  );
};

// Acciones superiores del Edit (volver)
const CiclosEditActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
    <ShowButton label="Ver" />
    <DeleteCicloButton />
  </TopToolbar>
);

const CiclosCreateActions = () => (
  <TopToolbar>
    <ListButton label="Volver al listado" icon={<ArrowBack />} />
  </TopToolbar>
);

const CiclosShowActions = () => {
  const record = useRecordContext();
  const disabled = record?.estado === 'Cerrado';
  const title = disabled ? 'No se puede editar: ciclo cerrado' : 'Editar';
  return (
    <TopToolbar>
      <ListButton label="Volver al listado" icon={<ArrowBack />} />
      <EditButton label="Editar" disabled={disabled} title={title} />
    </TopToolbar>
  );
};

export const CiclosLectivosShow = () => (
  <Show title="Ver ciclo lectivo" actions={<CiclosShowActions />}>
    <SimpleShowLayout>
      <TextField source="id_ciclo" label="ID" />
      <TextField source="anio" label="Año" />
      <DateField source="fecha_inicio" label="Fecha inicio" />
      <DateField source="fecha_fin" label="Fecha fin" />
      <FunctionField
        label="Inicio primer cuatrimestre"
        render={record =>
          record.inicio_primer_cuatrimestre
            ? <DateField record={record} source="inicio_primer_cuatrimestre" />
            : "No asignado"
        }
      />
      <FunctionField
        label="Fin primer cuatrimestre"
        render={record =>
          record.cierre_primer_cuatrimestre
            ? <DateField record={record} source="cierre_primer_cuatrimestre" />
            : "No asignado"
        }
      />
      <FunctionField
        label="Inicio segundo cuatrimestre"
        render={record =>
          record.inicio_segundo_cuatrimestre
            ? <DateField record={record} source="inicio_segundo_cuatrimestre" />
            : "No asignado"
        }
      />
      <FunctionField
        label="Fin segundo cuatrimestre"
        render={record =>
          record.cierre_segundo_cuatrimestre
            ? <DateField record={record} source="cierre_segundo_cuatrimestre" />
            : "No asignado"
        }
      />
      <TextField source="estado" label="Estado" />
    </SimpleShowLayout>
  </Show>
);
