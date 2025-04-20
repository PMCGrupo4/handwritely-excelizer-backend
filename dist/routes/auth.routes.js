"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }
        const { data, error } = await index_1.supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: data.user,
        });
    }
    catch (error) {
        console.error('Error en el registro:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }
        const { data, error } = await index_1.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            return res.status(401).json({ error: error.message });
        }
        return res.json({
            message: 'Inicio de sesión exitoso',
            session: data.session,
            user: data.user,
        });
    }
    catch (error) {
        console.error('Error en el inicio de sesión:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
router.post('/logout', async (_req, res) => {
    try {
        const { error } = await index_1.supabase.auth.signOut();
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.json({ message: 'Sesión cerrada exitosamente' });
    }
    catch (error) {
        console.error('Error al cerrar sesión:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
router.get('/me', async (_req, res) => {
    try {
        const { data: { session }, error: sessionError } = await index_1.supabase.auth.getSession();
        if (sessionError || !session) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const { data: { user }, error } = await index_1.supabase.auth.getUser(session.access_token);
        if (error) {
            return res.status(401).json({ error: error.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        return res.json({ user });
    }
    catch (error) {
        console.error('Error al obtener usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map