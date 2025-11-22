import type { User } from "$lib/Group/interface";

// interface.ts
export interface scheduledEvent {
    created_by: number;
    description?: string;
    end_date: string;
    event_id: number;
    poll?: number;
    score?: number | null;
    start_date: string;
    title: string;
    group_id?: number;
    work_group?: {
        id: number;
        name: string;
    };
    schedule_origin_name: 'user' | 'group';
    meeting_link?: string;
    repeat_frequency?: number; // 0: Never, 1: Daily, 2: Weekly, 3: Monthly, 4: Yearly, 5: Custom
    assignee_ids?: number[]; // List of assigned group member IDs
    reminders?: number[]; // List of reminder times in seconds
    schedule_origin_id?: number; // ID of the group where the event was created
}

export interface ScheduleItem2 {
    active: boolean | null;
    description: string | null;
    id: number;
    schedule_id: number;
    title: string;
    start_date: string;  // ISO timestamp
    end_date: string | null;  // ISO timestamp
    meeting_link: string | null;
    repeat_frequency?: number | null;
    tag_id: number;
    tag_name: string;
    origin_name: string;
    origin_id: number;
    schedule_origin_name: string;
    schedule_origin_id: number;
    reminders: number[] | null;
    user_tags: string[] | null;
    locked: boolean | null;
    subscribed: boolean;
}

export const ScheduleItem2Default = {
			id: 0,
			schedule_id: 0,
			title: '',
			description: '',
			start_date: new Date().toISOString().slice(0, 16),
			end_date: new Date().toISOString().slice(0, 16),
			active: true,
			meeting_link: '',
			tag_id: 0,
			tag_name: '',
			origin_name: '',
			origin_id: 0,
			schedule_origin_name: '',
			schedule_origin_id: 0,
			assignees: [],
			reminders: [],
			user_tags: [],
			locked: true,
			subscribed: false
		}

export interface WorkGroupScheduledEventCreate {
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    group_id: number;
    work_group_id?: number;
    assignee_ids?: number[];
    meeting_link?: string;
    repeat_frequency?: number;
    reminders?: number[];
}

export interface options {
    id: number;
    name: string;
}

export interface Filter {
    assignee: number | null;
    group: string | null;
    workgroup: number | null;
    search: string;
    type: 'home' | 'group'
}