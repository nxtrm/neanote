export interface UserSettings {
    username: string;
    email: string;
    preferences: {
        theme?: string;
        //add other fields later
    }
}

export interface UserGetResponse {
    data: UserSettings;
    message: string;
}