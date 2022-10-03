export interface User{
    id?: number;
    name?: string;
    username?: string;
    email?: string;
    role?: UserRole;
    password?: string;
}

export enum UserRole {
    ADMIN = 'admin',
    CHIEFEDITOR = 'chiefeditor',    
    EDITOR = 'editor',
    USER = 'user'
}