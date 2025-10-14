import {
    List,
    Datagrid,
    TextField,
    EmailField,
    EditButton, 
    ShowButton, 
    DeleteWithConfirmButton,
    ListButton,
    ArrayField,
    SingleFieldList,
    usePermissions,
    useNotify,
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
    email,
    PasswordInput,
    ReferenceInput,
    SelectInput,
    Show,
    SimpleShowLayout,
    minLength,
    FunctionField,
    useRecordContext,
    Toolbar,
    SaveButton
} from 'react-admin';
import { 
    Typography,
    Box,
    Grid,
    Chip
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

// Botón de eliminar con confirmación y toast personalizado
const DeleteUserButton = ({ record }) => {
    const notify = useNotify();
    return (
        <DeleteWithConfirmButton
            record={record}
            label={false}
            title="Eliminar"
            confirmTitle="Confirmar eliminación"
            confirmContent={
                <Box sx={{ mt: 1 }}>
                    <Typography>
                        Vas a eliminar al usuario <strong>{record?.nombre_completo || 'sin nombre'}</strong>
                        {record?.numero_documento ? (
                            <> (DNI N° <strong>{record.numero_documento}</strong>)</>
                        ) : null}.
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        Esta acción no se puede deshacer.
                    </Typography>
                </Box>
            }
            size="small"
            sx={{
                minWidth: 0,
                p: 0.25,
            }}
            mutationOptions={{
                onSuccess: () => {
                    notify('Usuario eliminado correctamente', { type: 'success' });
                },
                onError: (error) => {
                    notify(error?.message || 'Error al eliminar usuario', { type: 'warning' });
                },
            }}
        />
    );
};

// Filtros personalizados
const usuariosFilters = [
    <TextInput label="Buscar usuario" source="nombre_completo" alwaysOn />,
    <ReferenceInput
        label="Rol"
        source="id_rol"
        reference="roles"
    >
        <SelectInput optionText="nombre_rol" label="Rol" />
    </ReferenceInput>,
];

// Función para obtener el color del rol
const getRoleColor = (record) => {
    const roleColors = {
        1: '#F44336',
        2: '#9C27B0',
        3: '#4CAF50',
        4: '#FF9800',
        5: '#FDD835',
        6: '#2196F3',
        7: '#795548',
    };

    return roleColors[record?.id_rol] || '#607D8B';
};

// Formulario personalizado para Editar con valores por defecto
const CustomSimpleForm = ({ children, ...props }) => {
    const record = useRecordContext();
    if (!record) return null;

    const defaultValues = record ? { ...record } : {};

    return (
        <SimpleForm defaultValues={defaultValues} sanitizeEmptyValues id='form-edit-usuario' disableInvalidFormNotification {...props}>
            {children}
        </SimpleForm>
    );
};

// Toolbar personalizado según permisos
const UsuariosListActions = () => {
    //const { permissions } = usePermissions();
    const permissions = "admin"; // Forzar permisos de admin para pruebas
    return (
        <TopToolbar>
        <FilterButton label="Filtrar por" />
        {permissions === 'admin' && (
            <>
            <CreateButton label="Crear" />
            <ExportButton label="Exportar" />
            </>
        )}
        </TopToolbar>
    );
};

export const UsuariosList = () => {
    //const { permissions } = usePermissions();
    const permissions = "admin"; // Forzar permisos de admin para pruebas
    return (
        <List
            filters={usuariosFilters}
            actions={<UsuariosListActions />}
            perPage={5}
            sort={{ field: 'id_usuario', order: 'ASC' }}
        >
            <Datagrid rowClick="show">
                <TextField source="nombre_completo" label="Nombre Completo" />
                <TextField source="numero_documento" label="Documento" />
                <EmailField source="email" label="Email" />
                <TextField source="telefono" label="Teléfono" />
                <TextField source="direccion" label="Dirección" />
                <FunctionField
                    label="Fecha Nac."
                    render={record => {
                        const v = record?.fecha_nacimiento;
                        if (!v) return '';
                        const d = new Date(v);
                        if (!isNaN(d)) {
                            const dd = String(d.getDate()).padStart(2, '0');
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const yyyy = d.getFullYear();
                            return `${dd}-${mm}-${yyyy}`;
                        }
                        const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(String(v));
                        if (m) {
                            return `${m[3]}-${m[2]}-${m[1]}`;
                        }
                        return String(v);
                    }}
                />
                <TextField source="genero" label="Género" />

                {/* Roles del usuario */}
                <FunctionField
                    label="Rol"
                    render={record => {
                        const roles = record?.roles || [];
                        if (!roles.length) {
                            return (
                                <Chip
                                    label="Sin asignar"
                                    style={{ backgroundColor: '#9e9e9e', color: '#fff' }}
                                />
                            );
                        }
                        return (
                            <>
                                {roles.map((r, idx) => (
                                    <Chip
                                        key={idx}
                                        label={r?.nombre_rol || 'Sin nombre'}
                                        style={{ backgroundColor: getRoleColor(r), color: '#fff', marginRight: 4, marginBottom: 4 }}
                                    />
                                ))}
                            </>
                        );
                    }}
                />

                <FunctionField
                    label="Acciones"
                    render={(record) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ShowButton record={record} label={false} title="Ver usuario" size="small" sx={{ minWidth: 0, p: 0.25 }} />
                            {permissions === 'admin' && (
                                <EditButton record={record} label={false} title="Editar" size="small" sx={{ minWidth: 0, p: 0.25 }} />
                            )}
                            {permissions === 'admin' && (
                                <DeleteUserButton record={record} />
                            )}
                        </Box>
                    )}
                />
            </Datagrid>
        </List>
    );
};

// Toolbar del formulario de edición sin botón Delete
const CustomFormToolbar = () => (
    <Toolbar>
        <SaveButton label="Guardar" />
    </Toolbar>
);

// Acciones en la vista Editar (español)
const UsuariosEditActions = () => {
    const record = useRecordContext();
    const notify = useNotify();
    return (
        <TopToolbar>
            <ListButton label="Volver al listado" icon={<ArrowBack />} />
            <ShowButton label="Ver" />
            <DeleteWithConfirmButton
                record={record}
                label="Eliminar"
                confirmTitle="Confirmar eliminación"
                confirmContent={
                    <Box sx={{ mt: 1 }}>
                        <Typography>
                            Vas a eliminar al usuario <strong>{record?.nombre_completo || 'sin nombre'}</strong>
                            {record?.numero_documento ? (
                                <> (DNI N° <strong>{record.numero_documento}</strong>)</>
                            ) : null}.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                            Esta acción no se puede deshacer.
                        </Typography>
                    </Box>
                }
                size="small"
                sx={{ minWidth: 0, p: 0.25 }}
                mutationOptions={{
                    onSuccess: () => notify('Usuario eliminado correctamente', { type: 'success' }),
                    onError: (error) => notify(error?.message || 'Error al eliminar usuario', { type: 'warning' }),
                }}
            />
        </TopToolbar>
    );
};

// Acciones en la vista Ver (español)
const UsuariosShowActions = () => {
    const record = useRecordContext();
    const notify = useNotify();
    return (
        <TopToolbar>
            <ListButton label="Volver al listado" icon={<ArrowBack />} />
            <EditButton label="Editar" />
            <DeleteWithConfirmButton
                record={record}
                label="Eliminar"
                confirmTitle="Confirmar eliminación"
                confirmContent={
                    <Box sx={{ mt: 1 }}>
                        <Typography>
                            Vas a eliminar al usuario <strong>{record?.nombre_completo || 'sin nombre'}</strong>
                            {record?.numero_documento ? (
                                <> (DNI N° <strong>{record.numero_documento}</strong>)</>
                            ) : null}.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                            Esta acción no se puede deshacer.
                        </Typography>
                    </Box>
                }
                size="small"
                sx={{ minWidth: 0, p: 0.25 }}
                mutationOptions={{
                    onSuccess: () => notify('Usuario eliminado correctamente', { type: 'success' }),
                    onError: (error) => notify(error?.message || 'Error al eliminar usuario', { type: 'warning' }),
                }}
            />
        </TopToolbar>
    );
};

// Acciones en la vista Crear (español)
const UsuariosCreateActions = () => (
    <TopToolbar>
        <ListButton label="Volver al listado" icon={<ArrowBack />} />
    </TopToolbar>
);

export const UsuariosCreate = () => (
    <Create redirect="list" title="Crear usuario" actions={<UsuariosCreateActions />}>
        <SimpleForm id='form-create-usuario' disableInvalidFormNotification sanitizeEmptyValues>
            <Typography variant="h6" gutterBottom>Identidad</Typography>
            <Grid container rowSpacing={0.5} columnSpacing={3}>
                <Grid item size={12}>
                    <TextInput
                        source="nombre_completo"
                        label="Nombre Completo"
                        validate={[required("El nombre completo es requerido")]}
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                    <TextInput
                        source="numero_documento"
                        label="Documento"
                        validate={[required("El número de documento es requerido")]}
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                    <TextInput
                        source="legajo"
                        label="Legajo"
                        validate={[required("El legajo es requerido")]}
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                    <TextInput
                        source="genero"
                        label="Género"
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                    <DateInput
                        source="fecha_nacimiento"
                        label="Fecha de Nacimiento"
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <TextInput
                        source="telefono"
                        label="Teléfono"
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <TextInput
                        source="direccion"
                        label="Dirección"
                        fullWidth
                    />
                </Grid>
            </Grid>

            <Box mt={3}>
                <Typography variant="h6" gutterBottom>Acceso</Typography>
                <Grid container rowSpacing={0.5} columnSpacing={3}>
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <TextInput
                            source="email"
                            label="Email"
                            validate={[required("El email es requerido"), email("El email no es válido")]}
                            fullWidth
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <PasswordInput
                            source="contrasenia"
                            label="Contraseña"
                            validate={[required("La contraseña es requerida"), minLength(8, "Debe tener al menos 8 caracteres")]}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </Box>
        </SimpleForm>
    </Create>
);

export const UsuariosEdit = () => (
    <Edit title="Editar usuario" actions={<UsuariosEditActions />}>
        <CustomSimpleForm toolbar={<CustomFormToolbar />}>
            <Typography variant="h6" gutterBottom>Identidad</Typography>
            <Grid container rowSpacing={0.5} columnSpacing={3}>
                <Grid item size={12}>
                    <TextInput
                        source="nombre_completo"
                        label="Nombre Completo"
                        validate={[required("El nombre completo es requerido")]}
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                    <TextInput
                        source="numero_documento"
                        label="Documento"
                        validate={[required("El número de documento es requerido")]}
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                    <TextInput
                        source="legajo"
                        label="Legajo"
                        validate={[required("El legajo es requerido")]}
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                    <TextInput
                        source="genero"
                        label="Género"
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                    <DateInput
                        source="fecha_nacimiento"
                        label="Fecha de Nacimiento"
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <TextInput
                        source="telefono"
                        label="Teléfono"
                        fullWidth
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <TextInput
                        source="direccion"
                        label="Dirección"
                        fullWidth
                    />
                </Grid>
            </Grid>

            <Box mt={3}>
                <Typography variant="h6" gutterBottom>Acceso</Typography>
                <Grid container rowSpacing={0.5} columnSpacing={3}>
                    <Grid item size={12}>
                        <TextInput
                            source="email"
                            label="Email"
                            validate={[required("El email es requerido"), email("El email no es válido")]}
                            fullWidth
                        />
                    </Grid>

                </Grid>
            </Box>
        </CustomSimpleForm>
    </Edit>
);

export const UsuariosShow = () => (
    <Show title="Ver usuario" actions={<UsuariosShowActions />}>
        <SimpleShowLayout>
            <Typography variant="h6" gutterBottom>Información Personal</Typography>
            <Grid container rowSpacing={2} columnSpacing={3}>
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>ID de Usuario</Typography>
                    <TextField
                        source="id_usuario"
                        label="ID Usuario"
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Nombre Completo</Typography>
                    <TextField
                        source="nombre_completo"
                        label="Nombre Completo"
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Número de documento</Typography>
                    <TextField
                        source="numero_documento"
                        label="Documento"
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Legajo</Typography>
                    <TextField
                        source="legajo"
                        label="Legajo"
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Fecha de nacimiento</Typography>
                    <TextField
                        source="fecha_nacimiento"
                        label="Fecha de nacimiento"
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Género</Typography>
                    <TextField
                        source="genero"
                        label="Género"
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Teléfono</Typography>
                    <TextField
                        source="telefono"
                        label="Teléfono"
                    />
                </Grid>
                <Grid item size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Dirección</Typography>
                    <TextField
                        source="direccion"
                        label="Dirección"
                    />
                </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Acceso</Typography>
            <Grid container spacing={2}>
                <Grid item size={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Email</Typography>
                    <TextField
                        source="email"
                        label="Email"
                    />
                </Grid>
                <Grid item size={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Rol</Typography>
                    <FunctionField
                        render={record => {
                            const roles = record?.roles || [];
                            if (!roles.length) {
                                return (
                                    <Chip
                                        label="Sin asignar"
                                        style={{ backgroundColor: '#9e9e9e', color: '#fff' }}
                                    />
                                );
                            }
                            return (
                                <>
                                    {roles.map((r, idx) => (
                                        <Chip
                                            key={idx}
                                            label={r?.nombre_rol || 'Sin nombre'}
                                            style={{ backgroundColor: getRoleColor(r), color: '#fff', marginRight: 4, marginBottom: 4 }}
                                        />
                                    ))}
                                </>
                            );
                        }}
                    />
                </Grid>
            </Grid>
        </SimpleShowLayout>
    </Show>
);
