export interface ApiResponse<T> {
  data: T;
  errors?: any[];
  message?: string;
}
