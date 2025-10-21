import React, { useState, useEffect, useRef } from 'react';
import {
  List,
  Datagrid,
  TextField as RATextField,
  EmailField,
  TextInput,
  useRecordContext,
  useNotify,
  useRefresh,
  useDataProvider,
  useGetList,
  useListContext
} from 'react-admin';
import { Box, Button, MenuItem, Select } from '@mui/material';
import { EmptyState } from '../../components/EmptyState';

const RoleAssignCell = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const userId = record?.id_usuario || record?.id;
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: roles = [] } = useGetList('roles', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'id_rol', order: 'ASC' },
    filter: {},
  });

  const onAssign = async () => {
    if (!value) {
      notify('Selecciona un rol primero', { type: 'warning' });
      return;
    }
    try {
      setSaving(true);
      await dataProvider.asignarRolUsuario(userId, value);
      notify('Rol asignado correctamente', { type: 'success' });
      refresh();
    } catch (err) {
      notify(err?.message || 'Error al asignar rol', { type: 'warning' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <Select
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        displayEmpty
        sx={{ width: '42%' }}
      >
        <MenuItem value="" disabled>
          Seleccionar rol…
        </MenuItem>
        {roles.map((r) => (
          <MenuItem key={r.id || r.id_rol} value={r.id_rol || r.id}>
            {r.nombre_rol || `Rol ${r.id_rol || r.id}`}
          </MenuItem>
        ))}
      </Select>
      <Button variant="contained" size="small" onClick={onAssign} disabled={saving || !value}>
        {saving ? 'Guardando…' : 'Asignar'}
      </Button>
    </Box>
  );
};

export const AsignarRoles = () => {
  const filters = [
    <TextInput key="numero_documento" source="numero_documento" label="Buscar por número de documento" alwaysOn />,
  ]
  return (
    <List
      resource="usuarios-sin-rol"
      title="Asignar Roles"
      filters={filters}
      perPage={10}
      sort={{ field: 'id_usuario', order: 'ASC' }}
      empty={<EmptyState title="Sin resultados" subtitle="No se encontraron usuarios sin rol con los filtros actuales." />}
    >
      <ResetFilters />
      <Datagrid bulkActionButtons={false} rowClick={false}>
        <RATextField source="apellido" label="Apellido" />
        <RATextField source="nombre" label="Nombre" />
        <RATextField source="numero_documento" label="Documento" />
        <EmailField source="email" label="Email" />
        <RoleAssignCell label="Asignar rol" />
      </Datagrid>
    </List>
  );
};

const ResetFilters = () => {
    const { setFilters } = useListContext();
    const initialized = useRef(false); // guarda si ya se limpió una vez

    useEffect(() => {
        if (!initialized.current) {
            setFilters({}, []); // limpia todos los filtros activos solo la primera vez
            initialized.current = true;
        }
    }, [setFilters]);

    return null;
};
