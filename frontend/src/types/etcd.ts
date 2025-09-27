export interface EtcdConnectRequest {
  endpoints: string[];
  timeoutMs?: number;
}
