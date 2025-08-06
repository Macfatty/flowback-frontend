export interface report {
    title: string;
    description: string;
    group_id: number;
    post_id: number;
    post_type: 'poll' | 'thread'
}

export interface ModalButton {
    label: string;
    type: 'primary' | 'secondary' | 'warning' | 'default';
    class?: string;
    onClick: () => void;
    submit?: boolean;
}