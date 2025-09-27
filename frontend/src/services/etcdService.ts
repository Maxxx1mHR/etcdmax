import type { EtcdConnectRequest } from "@/types/etcd";
import { api } from "../core/api";

export type PutParams = { key: string; node: { value: object | string } };

export type Key = { key: string; value: string };
export type Keys = { key: string; value: string }[];

export const setConnect = async (data: EtcdConnectRequest) => {
  return await api.post("api/v2/etcd/connect", data);
};

export const getKeys = async (): Promise<Keys> => {
  return (await api.get("api/v2/keys")).data;
};

export const saveNode = async ({ key, node }: PutParams) => {
  return await api.put(`api/v2/keys/${key}`, node);
};

export const disconnect = async () => {
  return await api.post("api/v2/etcd/disconnect");
};

export const deleteNode = async ({ key }: { key: string }) => {
  return await api.delete(`api/v2/keys/${key}`);
};
