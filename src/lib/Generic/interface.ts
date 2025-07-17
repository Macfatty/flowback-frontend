export interface report {
    title: string;
    description: string;
    group_id: number;
    post_id: number;
    post_type: 'poll' | 'thread'
}