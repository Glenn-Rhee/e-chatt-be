export interface ResponsePayload<T = unknown> {
  code: number;
  status: "success" | "failed";
  message: string;
  data: T;
}
