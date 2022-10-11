import { BlogEntry } from "src/blog/model/blog-entry.interface";

export interface User{
    id?: number;
    name?: string;
    username?: string;
    email?: string;
    role?: UserRole;
    password?: string;
    profileImage?: string;
    blogEntries?: BlogEntry[]
}

export enum UserRole {
    ADMIN = 'admin',
    CHIEFEDITOR = 'chiefeditor',    
    EDITOR = 'editor',
    USER = 'user'
}