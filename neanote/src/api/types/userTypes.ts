export interface UserSettings {
    username: string;
    email: string;
    password?: string
    preferences: {
        theme?: 'light' | 'dark' | 'system';
        model?: string;
        //add other fields later
    }
}

export interface UserGetResponse {
    data: UserSettings;
    message: string;
}

export interface UserLoginResponse {
    preferences: UserSettings['preferences'];
    message: string;
}