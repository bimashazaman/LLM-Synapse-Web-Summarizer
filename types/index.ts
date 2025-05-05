export interface Summary {
  id?: string
  url: string
  title: string
  summary: string
  timestamp: string
}

export interface SummaryResponse {
  url: string
  title: string
  summary: string
  timestamp: string
}

export interface SummaryRequest {
  url: string
}

export interface ErrorResponse {
  error: string
}
