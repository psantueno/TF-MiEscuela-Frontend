import React, { useState, useEffect, useRef } from 'react';
import {
  List,
  Datagrid,
  TextField as RATextField,
  EmailField,
  TextInput,
  FunctionField,
  useRecordContext,
  useNotify,
  useRefresh,
  useDataProvider,
  ReferenceInput,
  SelectInput,
  useGetList,
  Confirm,
  useListContext
} from 'react-admin';
import { Box, Button, MenuItem, Select, Tooltip, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import useUser from '../../contexts/UserContext/useUser';
import { EmptyState } from '../../components/EmptyState';

const RoleChangeCell = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const { user } = useUser();

  const isSelf = !!user && (record?.id_usuario === user?.id_usuario || record?.id === user?.id_usuario);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Cargar roles desde el backend (consistencia con AsignarRoles)
  const { data: roles = [] } = useGetList('roles', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'id_rol', order: 'ASC' },
    filter: {},
  });

  const onAssign = async () => {
    if (isSelf) {
      notify('No podes modificar tu propio rol', { type: 'warning' });
      return;
    }
    if (!value) {
      notify('Selecciona un rol primero', { type: 'warning' });
      return;
    }
    try {
      setSaving(true);
      const idUsuario = record?.id_usuario || record?.id;
      await dataProvider.asignarRolUsuario(idUsuario, value);
      notify('Rol actualizado correctamente', { type: 'success' });
      refresh();
    } catch (err) {
      notify(err?.message || 'Error al actualizar rol', { type: 'warning' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Tooltip title={isSelf ? 'No podes modificar tu propio rol' : ''}>
        <span>
          <Select
            size="small"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            displayEmpty
            sx={{ minWidth: 160 }}
            disabled={isSelf}
          >
            <MenuItem value="" disabled>
              Seleccionar rol...
            </MenuItem>
            {roles.map((r) => (
              <MenuItem key={r.id || r.id_rol} value={r.id_rol || r.id}>
                {r.nombre_rol || `Rol ${r.id_rol || r.id}`}
              </MenuItem>
            ))}
          </Select>
        </span>
      </Tooltip>
      <Tooltip title={isSelf ? 'No podes modificar tu propio rol' : ''}>
        <span>
          <Button variant="contained" size="small" onClick={onAssign} disabled={saving || !value || isSelf}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};

const RemoveRoleCell = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const { user } = useUser();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isSelf = !!user && (record?.id_usuario === user?.id_usuario || record?.id === user?.id_usuario);
  const hasRole = Array.isArray(record?.roles) && record.roles.length > 0;
  const [saving, setSaving] = useState(false);

  const onRemove = async () => {
    if (isSelf) {
      notify('No podes quitar tu propio rol', { type: 'warning' });
      return;
    }
    if (!hasRole) {
      notify('Este usuario no tiene rol asignado', { type: 'info' });
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <>
      <Tooltip title={isSelf ? 'No podes quitar tu propio rol' : ''}>
        <span>
          <IconButton
            aria-label="Quitar rol"
            onClick={onRemove}
            disabled={!hasRole || isSelf || saving}
            size="small"
            disableRipple
            disableFocusRipple
            title='Quitar rol'
            sx={{
              color: 'error.main',
              '&:hover': { bgcolor: 'error.main', color: 'common.white' },
              transition: 'background-color 0.2s, color 0.2s',
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Confirm
        isOpen={confirmOpen}
        title="Quitar rol"
        content={`Quieres quitar el rol asignado a ${record?.nombre_completo || 'este usuario'}?`}
        confirm="Quitar"
        cancel="Cancelar"
        onConfirm={async () => {
          const idUsuario = record?.id_usuario || record?.id;
          try {
            setSaving(true);
            await dataProvider.desasignarRolUsuario(idUsuario);
            notify('Rol quitado correctamente', { type: 'success' });
            refresh();
          } catch (err) {
            notify(err?.message || 'Error al quitar rol', { type: 'warning' });
          } finally {
            setSaving(false);
            setConfirmOpen(false);
          }
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export const ModificarRoles = () => {
  return (
    <List
      resource="usuarios"
      title="Modificar Roles"
      filters={[
        <TextInput key="numero_documento" source="numero_documento" label="Buscar por número de documento" alwaysOn />,
        <ReferenceInput key="frol" label="Rol" source="id_rol" reference="roles">
          <SelectInput optionText="nombre_rol" label="Rol" />
        </ReferenceInput>,
      ]}
      perPage={10}
      sort={{ field: 'id_usuario', order: 'ASC' }}
      empty={<EmptyState title="Sin resultados" subtitle="No se encontraron usuarios con los filtros actuales." />}
    >
      <ResetFilters />
      <Datagrid rowClick={false} bulkActionButtons={false}>
        <RATextField source="apellido" label="Apellido" />
        <RATextField source="nombre" label="Nombre" />
        <RATextField source="numero_documento" label="Documento" />
        <EmailField source="email" label="Email" />
        <FunctionField
          label="Rol actual"
          render={(record) => {
            const roles = record?.roles || [];
            if (!roles.length) return 'Sin asignar';
            return roles.map((r) => r?.nombre_rol).join(', ');
          }}
        />
        <RoleChangeCell label="Cambiar rol" />
        <RemoveRoleCell
          label="Quitar rol"
          headerClassName="col-actions"
          cellClassName="col-actions"
        />
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
