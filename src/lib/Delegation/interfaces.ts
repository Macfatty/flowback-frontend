import type { GroupUser } from '$lib/User/interfaces';
import type { DelegateMinimal} from '$lib/Group/interface';

export interface Delegate {
	tags: { id: number; tag_name: string; name: string; active: boolean }[];
	isInRelation: boolean;
	active: boolean;
	group_id: number;
	group_image: string;
	profile_image: string;
	group_name: string;
	id: number;
	pool_id: number;
	is_admin: boolean;
	permission_id: number | null;
	permission_name: string | null;
	user: {
		banner_image: string;
		id: number;
		profile_image: string;
		username: string;
	};
}

export interface VoteHistory {
	poll_id: number;
	poll_title: string;
	vote: [
		{
			proposal_id: number;
			proposal_title: string;
			proposal_description?: string;
			proposal_created_by_id: number;
			proposal_created_by_name: string;
			score?: number;
			raw_score?: number;
		}
	];
	poll_description?: string;
	subject_area?: string;
	tag_name?: string;
	historical_data?: any;
	created_at?: string;
	poll_interval_mean_absolute_correctness?: number | null;
}

export interface DelegatePool {
	blockchain_id: null | number;
	delegate_pool_id: number;
	delegates: {
		delegate_id: number;
		group_user_id: number;
		user_id: number;
		group_user: GroupUser;
	}[];
	id: number;
	tags: { id: number; name: string; tag_name?: string; active?: boolean }[];
}

export interface DelegateRelation {
	blockchain_id?: null | number;
	delegate_pool_id: number;
	delegates: DelegateMinimal[];
	id: number;
	tags: { name: string; id: number; active: boolean }[];
}
