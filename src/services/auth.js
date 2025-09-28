import { api } from "./api";

export const login = async (email, contrasenia) => {
    const response = await api.post("/auth/login", { email, contrasenia });
    return response.data;
};