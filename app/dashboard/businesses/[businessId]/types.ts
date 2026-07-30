export type Business = {
  id: string;
  name: string;
  industry: string | null;
  created_at: string;
};

export type DashboardStats = {
  totalRecords: number;
  datasetCount: number;
  customFieldCount: number;
  dataQualityScore: number;
  validationIssueCount: number;
  insightCount: number;
};