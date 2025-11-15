export interface notification {
    action: 'update' | 'CREATED';
    channel_name: 'group';
    channel_date: {
        group_id: number;
        group_image: string;
        group_name: string;
    }
    data: {
        group_id: number;
        group_image: null | string;
        group_name: string;
        poll_id: number;
        poll_title: string;
        work_group_id: null | number
        work_group_name: null | string
    }
    id: number;
    message: string;
    object_id: number;
    read: boolean;
    timestamp: string;

}