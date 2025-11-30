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
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Typography, Chip, Stack } from '@mui/material';
import { EmptyState } from '../../components/EmptyState';

// Helper para mostrar etiqueta de curso "NÂ° D"
const formatCursoLabel = (cursoLike) => {
  if (!cursoLike) return '';
  const anio = cursoLike.anio_escolar || cursoLike.anio || '';
  const div = cursoLike.division || '';
  const label = `${anio ? anio + 'Â°' : ''}${div ? ` ${div}` : ''}`.trim();
  return label;
};

const CambiarCursoListActions = () => (
  <TopToolbar>
    <FilterButton label="Agregar filtros" />
    <ExportButton label="Exportar" />
  </TopToolbar>
);

// Filtro por curso dependiente del ciclo seleccionado
const CursoFilterInput = ({ source = 'id_curso', label = 'Curso' }) => {
  const { filterValues } = useListContext();
  const idCiclo = filterValues?.id_ciclo;
  return (
    <ReferenceInput
      source={source}
      label={label}
      reference="cursos"
      filter={{ ...(idCiclo ? { id_ciclo: idCiclo } : {}), estado: ['Abierto', 'Planeamiento'] }}
      perPage={1000}
      sort={{ field: 'anio_escolar', order: 'ASC' }}
      parse={(v) => (v != null ? Number(v) : v)}
      format={(v) => v}
    >
      <SelectInput
        optionText={(choice) => formatCursoLabel(choice) || `Curso ${choice?.id_curso || choice?.id || ''}`}
        label={label}
        resettable
      />
    </ReferenceInput>
  );
};

const BulkMoveCoursesButton = () => {
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

  const { data: pageRows = [] } = useListContext();
    const onConfirm = async () => {
    if (!curso) {
      notify('Selecciona un curso destino para continuar.', { ...notifyOpts, type: 'warning' });
      return;
    }
    try {
      setSaving(true);
      const rowsMap = new Map((pageRows || []).map(r => [r.id, r]));
      const blocked = (selectedIds || []).filter(id => rowsMap.get(id)?.cambio_programado);
      const validIds = (selectedIds || []).filter(id => !rowsMap.get(id)?.cambio_programado);

      if (blocked.length && !validIds.length) {
        notify('Todos los seleccionados ya tienen un cambio programado.', { ...notifyOpts, type: 'warning' });
        setSaving(false);
        return;
      }
      if (blocked.length) {
        notify(`Se excluirán ${blocked.length} alumno(s) con cambio programado.`, { ...notifyOpts, type: 'info' });
      }

      const idsToSend = validIds.length ? validIds : selectedIds;
      const { data } = await dataProvider.moverCursoAlumnos(idsToSend, Number(curso));
      const updated = data?.updated ?? 0;
      const total = idsToSend.length;
      const failed = total - updated;

      notify(
        `Movidos ${updated}/${total}${failed ? `, errores: ${failed}` : ''}`,
        { ...notifyOpts, type: failed ? 'warning' : 'success' },
      );
      refresh();
      setOpen(false);
      setCurso('');
    } catch (e) {
      const msg = e?.body?.error || e?.body?.message || e?.message || 'Error cambiando de curso';
      const tone = e?.status >= 500 ? 'error' : 'warning';
      notify(msg, { ...notifyOpts, type: tone });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="contained" size="small" onClick={() => setOpen(true)} disabled={disabled}>
        Mover a cursoâ€¦
      </Button>
      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Mover {selectedIds.length} alumno(s) a otro curso</DialogTitle>
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
              <MenuItem value="" disabled>Seleccionar curso destinoâ€¦</MenuItem>
              {cursos.map((c) => {
                const id = Number(c.id_curso || c.id);
                const anio = c.anio_escolar || c.anio || '';
                const div = c.division || '';
                const label = `${anio ? anio + 'Â°' : ''}${div ? ` ${div}` : ''}`.trim() || `Curso ${id}`;
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

const CambiarCursoContent = ({ defaultCicloId }) => {
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
    <CursoFilterInput key="f_curso" source="id_curso" label="Curso" />,
    <TextInput key="f_dni" source="numero_documento" label="Buscar por DNI" alwaysOn />,
    <TextInput key="f_apellido" source="apellido" label="Apellido" />,
    <TextInput key="f_nombre" source="nombre" label="Nombre" />,
  ];

  return (
    <List
      resource="alumnos-con-curso"
      title="Cambiar de curso"
      actions={<CambiarCursoListActions />}
      filters={filters}
      filterDefaultValues={defaultCicloId ? { id_ciclo: defaultCicloId } : undefined}
      perPage={10}
      sort={{ field: 'apellido', order: 'ASC' }}
      empty={<EmptyState title="Sin resultados" subtitle="No se encontraron alumnos con curso activo segÃºn filtros." />}
    >
      <Datagrid
        rowClick={false}
        bulkActionButtons={<BulkMoveCoursesButton />}
        isRowSelectable={(record) => !record?.cambio_programado}
      >
        <RATextField source="apellido" label="Apellido" />
        <RATextField source="nombre" label="Nombre" />
        <RATextField source="numero_documento" label="DNI NÂº" />
        <FunctionField
          label="Curso actual"
          render={(record) => {
            const cursoObj = record?.cursos?.[0] || record?.curso;
            const anio = cursoObj?.anio_escolar || cursoObj?.anio;
            const div = cursoObj?.division;
            const label = `${anio ? anio + 'Â°' : ''}${div ? ` ${div}` : ''}`.trim() || record?.curso_actual || record?.nombre_curso || record?.curso;
            return <strong>{label || 'â€”'}</strong>;
          }}
        />
        <FunctionField
          label="Cambio programado"
          render={(record) => {
            if (!record?.cambio_programado) return null;
            const pc = record?.proximo_curso || {};
            const anio = pc?.anio_escolar || pc?.anio;
            const div = pc?.division;
            const nombre = pc?.nombre_curso || `${anio ? anio + 'Â°' : ''}${div ? ` ${div}` : ''}`.trim();
            const f = pc?.fecha_inicio ? new Date(pc.fecha_inicio) : null;
            const dd = f ? String(f.getDate()).padStart(2, '0') : '';
            const mm = f ? String(f.getMonth() + 1).padStart(2, '0') : '';
            const yyyy = f ? f.getFullYear() : '';
            const fecha = f ? `${dd}/${mm}/${yyyy}` : '';
            return (
              <Stack direction="row" spacing={1}>
                <Chip size="small" color="warning" label={`Cambiado a ${nombre}${fecha ? ` â€“ desde ${fecha}` : ''}`} />
              </Stack>
            );
          }}
        />
      </Datagrid>
    </List>
  );
};

export const CambiarCurso = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const { data: ciclos = [], isLoading } = useGetList('ciclos-lectivos', {
    pagination: { page: 1, perPage: 1 },
    sort: { field: 'anio', order: 'DESC' },
    filter: { anio: currentYear, estado: ['Abierto', 'Planeamiento', 'abierto', 'planeamiento'] },
  });
  const defaultCicloId = ciclos?.[0]?.id_ciclo || ciclos?.[0]?.id;
  return <CambiarCursoContent defaultCicloId={defaultCicloId} />;
};




