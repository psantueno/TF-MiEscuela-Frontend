import React, { useMemo, useState } from 'react';
import {
  List,
  Datagrid,
  TextField as RATextField,
  TextInput,
  ReferenceInput,
  SelectInput,
  TopToolbar,
  FilterButton,
  ExportButton,
  FunctionField,
  useListContext,
  useDataProvider,
  useNotify,
  useRefresh,
  useGetList,
} from 'react-admin';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Typography } from '@mui/material';
import { EmptyState } from '../../components/EmptyState';

const AsignarCursosListActions = () => (
  <TopToolbar>
    <FilterButton label="Agregar filtros" />
    <ExportButton label="Exportar" />
  </TopToolbar>
);

const BulkAssignCoursesButton = () => {
  const { selectedIds = [], filterValues = {} } = useListContext();
  const notify = useNotify();
  const notifyOpts = { autoHideDuration: 7000 };
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const [open, setOpen] = useState(false);
  const [curso, setCurso] = useState('');
  const [saving, setSaving] = useState(false);

  const idCiclo = filterValues?.id_ciclo;

  const { data: cursos = [] } = useGetList('cursos', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'id_curso', order: 'ASC' },
    filter: idCiclo ? { id_ciclo: idCiclo, estado: ['Abierto', 'Planeamiento', 'abierto', 'planeamiento'] } : {},
  }, { enabled: !!idCiclo });

  const disabled = !idCiclo || !selectedIds?.length;

  const onConfirm = async () => {
    if (!curso) {
      notify('Selecciona un curso destino para continuar.', { ...notifyOpts, type: 'warning' });
      return;
    }
    try {
      setSaving(true);
      const { data } = await dataProvider.asignarCursoAlumnos(selectedIds, Number(curso));
      const updated = data?.updated ?? 0;
      const total = selectedIds.length;
      const failed = total - updated;
      notify(
        `Asignados ${updated}/${total}${failed ? `, errores: ${failed}` : ''}`,
        { ...notifyOpts, type: failed ? 'warning' : 'success' },
      );
      refresh();
      setOpen(false);
      setCurso('');
    } catch (e) {
      const detail = e?.body?.error || e?.message;
      notify(
        detail ? `No se pudieron asignar algunos cursos: ${detail}` : 'Error asignando cursos.',
        { ...notifyOpts, type: 'warning' },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="contained" size="small" onClick={() => setOpen(true)} disabled={disabled}>
        Asignar a curso…
      </Button>
      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Asignar {selectedIds.length} alumno(s) a un curso</DialogTitle>
        <DialogContent>
          {!idCiclo && <Typography color="text.secondary">Selecciona un ciclo lectivo para listar cursos.</Typography>}
          <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Select
              size="small"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              displayEmpty
              fullWidth
              disabled={!idCiclo}
            >
              <MenuItem value="" disabled>Seleccionar curso…</MenuItem>
              {cursos.map((c) => {
                const id = Number(c.id_curso || c.id);
                const anio = c.anio_escolar || c.anio || '';
                const div = c.division || '';
                const label = `${anio ? anio + '°' : ''}${div ? ` ${div}` : ''}`.trim() || `Curso ${id}`;
                return (
                  <MenuItem key={id} value={id}>
                    {label}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={onConfirm} disabled={saving || !curso}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AsignarCursosContent = ({ defaultCicloId }) => {
  const filters = [
    <ReferenceInput
      key="f_ciclo"
      source="id_ciclo"
      reference="ciclos-lectivos"
      alwaysOn
      filter={{ estado: ['Abierto', 'Planeamiento'] }}
      perPage={100}
      sort={{ field: 'anio', order: 'DESC' }}
    >
      <SelectInput optionText="anio" label="Ciclo lectivo" emptyText={false} resettable={false} />
    </ReferenceInput>,
    <TextInput key="f_dni" source="numero_documento" label="Buscar por DNI" alwaysOn />,
    <TextInput key="f_apellido" source="apellido" label="Apellido" />,
    <TextInput key="f_nombre" source="nombre" label="Nombre" />,
  ];

  return (
    <List
      resource="alumnos-sin-curso"
      title="Asignar cursos"
      actions={<AsignarCursosListActions />}
      filters={filters}
      filterDefaultValues={defaultCicloId ? { id_ciclo: defaultCicloId } : undefined}
      perPage={10}
      sort={{ field: 'apellido', order: 'ASC' }}
      empty={<EmptyState title="Sin resultados" subtitle="No se encontraron alumnos sin curso con los filtros actuales." />}
    >
      <Datagrid rowClick={false} bulkActionButtons={<BulkAssignCoursesButton />}>
        <RATextField source="apellido" label="Apellido" />
        <RATextField source="nombre" label="Nombre" />
        <RATextField source="numero_documento" label="DNI Nº" />
      </Datagrid>
    </List>
  );
};

export const AsignarCursos = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const { data: ciclos = [], isLoading } = useGetList('ciclos-lectivos', {
    pagination: { page: 1, perPage: 1 },
    sort: { field: 'anio', order: 'DESC' },
    filter: { anio: currentYear },
  });
  const defaultCicloId = ciclos?.[0]?.id_ciclo || ciclos?.[0]?.id;

  if (isLoading) {
    return null; // evita disparar la lista sin ciclo por defecto
  }
  if (!defaultCicloId) {
    return <div style={{ padding: 16 }}>No se encontró ciclo lectivo del año actual.</div>;
  }

  return <AsignarCursosContent defaultCicloId={defaultCicloId} />;
};
