export type InsightSource =
  | "deterministic"
  | "ai";

export type InsightCategory =
  | "category"
  | "numeric"
  | "date"
  | "quality"
  | "general";

export type Insight = {
  id: string;
  title: string;
  description: string;
  source: InsightSource;
  category: InsightCategory;
};