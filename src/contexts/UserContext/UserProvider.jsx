import { useState } from "react";
import UserContext from "./UserContext";

const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        nombre_completo: "Test",
        email: "test@gmail.com",
        rol: "admin",
        notificaciones: 1
    }); // Estado inicial del usuario (para no tener que loguearse cada vez que recarga la página)

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
