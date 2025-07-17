export interface ProfileHeaderProps {
    name: string | null | undefined;
    email: string | null | undefined;
}

export interface ProfileInfoCardProps {
    email: string | null | undefined;
}

export interface GenderSettingsCardProps {
    userSex: "male" | "female" | null;
    isLoading: boolean;
    onSexChange: (sex: "male" | "female") => void;
}

export interface AccountSettingsCardProps {
    isDeleting: boolean;
    onDeleteAccount: () => void;
    onLogout: () => void;
}
