export interface MenuWineRecommendation {
  wine_name: string;
  reason: string;
  estimated_price?: string;
  wine_type?: string;
}

export interface MenuRecommendationResponse {
  summary: string;
  recommendations: MenuWineRecommendation[];
}