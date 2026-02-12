import type { GroupUser } from '$lib/Group/interface';
import type { proposal } from '$lib/Poll/interface';

export interface KPI {
  id: number;
  name: string;
  description: string;
  active: boolean;
  values: number[];
}

export interface KPIBetProposal {
  id: number;
  created_by: GroupUser;
  proposal: proposal;
  kpi_id: number;
  kpi_name: string;
  kpi_description: string;
  value: number;
  weight: number;
}


