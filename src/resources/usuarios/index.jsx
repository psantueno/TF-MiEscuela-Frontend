import {
    List, 
    Datagrid, 
    TextField, 
    EmailField,
    EditButton, 
    ShowButton, 
    DeleteButton,
    ArrayField,
    SingleFieldList, 
    ChipField,
    usePermissions, 
    TopToolbar, 
    CreateButton, 
    ExportButton, 
    FilterButton,
    Create, 
    Edit,
    SimpleForm, 
    TextInput, 
    required,
    email,
    PasswordInput, 
    ReferenceInput,
    SelectInput,
    Show, 
    SimpleShowLayout,
    minLength
} from 'react-admin';
import Stack from '@mui/material/Stack';

// Filtros personalizados
const usuariosFilters = [
    <TextInput label="Buscar usuario" source="nombre_completo" alwaysOn />,
    <ReferenceInput 
        label="Rol" 
        source="id_rol" 
        reference="roles"
    >
        <SelectInput optionText="nombre_rol" label="Rol"/>
    </ReferenceInput>,
];

// Función para obtener el color del rol
const getRoleColor = (id_rol) => {
    const roleColors = {
        'Administrador': '#F44336',
        'Director': '#9C27B0',
        'Docente': '#4CAF50',
        'Auxiliar': '#FF9800',
        'Asesor Pedagogico': '#FDD835',
        'Alumno': '#2196F3',
        'Tutor': '#795548',
    };

    return roleColors[id_rol] || '#607D8B';
};

// Toolbar personalizado según permisos
const UsuariosListActions = () => {
    //const { permissions } = usePermissions();
    const permissions = "admin"; // Forzar permisos de admin para pruebas
    return (
        <TopToolbar>
        <FilterButton />
        {permissions === 'admin' && (
            <>
            <CreateButton />
            <ExportButton />
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
                <TextField source="id_usuario" label="ID Usuario" />
                <TextField source="nombre_completo" label="Nombre Completo" />
                <TextField source="numero_documento" label="Documento" />
                <EmailField source="email" label="Email" />
                <TextField source="telefono" label="Teléfono" />
                <TextField source="direccion" label="Dirección" />
                <TextField source="fecha_nacimiento" label="Fecha Nac." />
                <TextField source="genero" label="Género" />
                
                {/* Roles del usuario */}
                <ArrayField label="Roles" source="roles">
                    <SingleFieldList>
                        <ChipField source="nombre_rol" />
                    </SingleFieldList>
                </ArrayField>

                {permissions === 'admin' && <EditButton />}
                {permissions === 'admin' && <DeleteButton />}
                <ShowButton />
            </Datagrid>
        </List>
    );
};

export const UsuariosCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <Stack spacing={1} sx={{ width: '100%' }}>
                <TextInput 
                    source="nombre_completo" 
                    label="Nombre Completo" 
                    validate={[required("El nombre completo es requerido")]} 
                    fullWidth 
                    sx={{
                        "& .MuiFormHelperText-root.Mui-error": {
                        marginBottom: "12px", 
                        },
                    }}
                />
                <TextInput 
                    source="numero_documento" 
                    label="Documento" 
                    validate={[required("El número de documento es requerido")]} 
                    fullWidth 
                    sx={{
                        "& .MuiFormHelperText-root.Mui-error": {
                            marginBottom: "12px",
                        },
                    }}
                />
                <TextInput 
                    source="email" 
                    label="Email" 
                    validate={[required("El email es requerido"), email("El email no es válido")]} 
                    fullWidth 
                    sx={{
                        "& .MuiFormHelperText-root.Mui-error": {
                            marginBottom: "12px",
                        },
                    }}
                />
                <PasswordInput 
                    source="contrasenia" 
                    label="Contraseña"
                    validate={[required("La contraseña es requerida"), minLength(8, "La contraseña debe tener al menos 8 caracteres")]}
                    fullWidth
                    sx={{
                        "& .MuiFormHelperText-root.Mui-error": {
                            marginBottom: "12px",
                        },
                    }}
                />
                <TextInput 
                    source="telefono" 
                    label="Teléfono" 
                    fullWidth 
                />
                <TextInput 
                    source="direccion" 
                    label="Dirección" 
                    fullWidth 
                />
                <TextInput 
                    source="fecha_nacimiento" 
                    label="Fecha Nac." 
                    fullWidth 
                />
                <ReferenceInput 
                    source="id_rol" 
                    reference="roles"
                >
                    <SelectInput 
                        optionText="nombre_rol" 
                        label="Rol"
                        validate={[required("El rol es requerido")]}
                    />
                </ReferenceInput>
            </Stack>
        </SimpleForm>
    </Create>
);

export const UsuariosEdit = () => (
    <Edit>
        <SimpleForm idFormMessage="El formulario contiene errores. Por favor corrígelos antes de continuar.">
            <Stack spacing={1} sx={{ width: '100%' }}>
                <TextInput 
                    source="id_usuario"
                    label="ID Usuario" 
                    inputProps={{ readOnly: true }}
                    fullWidth
                />
                <TextInput 
                    source="nombre_completo" 
                    label="Nombre Completo" 
                    validate={[required("El nombre completo es requerido")]} 
                    fullWidth 
                    sx={{
                        "& .MuiFormHelperText-root.Mui-error": {
                        marginBottom: "12px", 
                        },
                    }}
                />
                <TextInput 
                    source="numero_documento" 
                    label="Documento" 
                    validate={[required("El número de documento es requerido")]} 
                    fullWidth 
                    sx={{
                        "& .MuiFormHelperText-root.Mui-error": {
                            marginBottom: "12px",
                        },
                    }}
                />
                <TextInput 
                    source="email" 
                    label="Email" 
                    validate={[required("El email es requerido"), email("El email no es válido")]} 
                    fullWidth 
                    sx={{
                        "& .MuiFormHelperText-root.Mui-error": {
                            marginBottom: "12px",
                        },
                    }}
                />
                <TextInput 
                    source="telefono" 
                    label="Teléfono" 
                    fullWidth 
                />
                <TextInput 
                    source="direccion" 
                    label="Dirección" 
                    fullWidth 
                />
                <TextInput 
                    source="fecha_nacimiento" 
                    label="Fecha Nac." 
                    fullWidth 
                />
                <ReferenceInput 
                    source="id_rol" 
                    reference="roles"
                >
                    <SelectInput 
                        optionText="nombre_rol" 
                        label="Rol"
                    />
                </ReferenceInput>
            </Stack>
        </SimpleForm>
    </Edit>
);

export const UsuariosShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField 
                source="id_usuario" 
                label="ID Usuario" />
            <TextField 
                source="nombre_completo" 
                label="Nombre Completo" />
            <TextField 
                source="numero_documento" 
                label="Documento" />
            <TextField 
                source="email" 
                label="Email" />
            <TextField 
                source="telefono" 
                label="Teléfono" />
            <TextField 
                source="direccion" 
                label="Dirección" />
            <TextField 
                source="fecha_nacimiento" 
                label="Fecha Nac." />
            <TextField 
                source="genero" 
                label="Género" />

            <ArrayField label="Roles" source="roles">
                <SingleFieldList>
                    <ChipField source="nombre_rol" />
                </SingleFieldList>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);
