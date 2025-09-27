import { combine, createDomain, sample } from "effector";
import { createGate } from "effector-react";
import {
  deleteNode,
  disconnect,
  getKeys,
  saveNode,
  setConnect,
  type Keys,
  type PutParams,
} from "../../services/etcdService";
import { modalStateFactory } from "../../utils/modalStateFactory";

export type EtcdConnectForm = {
  port: string;
  endpoints: {
    protocol?: string;
    host: string;
  }[];
  timeoutMs?: string;
};

export const etcdDomain = createDomain();
export const EtcdGate = createGate();

// Stores
export const $keys = etcdDomain.createStore<Keys>([]);
export const $selectedKeys = etcdDomain.createStore<Set<string>>(new Set());
export const $deleteNode = etcdDomain.createStore("");
export const $isConnected = etcdDomain.createStore(false);

// Events
export const etcdConnectFormSubmitted =
  etcdDomain.createEvent<EtcdConnectForm>();

export const keySelected = etcdDomain.createEvent<Set<string>>();
export const keyUpdated = etcdDomain.createEvent<string>();
export const configSaved = etcdDomain.createEvent<PutParams>();
export const etcdDisconnected = etcdDomain.createEvent();
export const nodeDeleteSelected = etcdDomain.createEvent<string>();
export const nodeDeleted = etcdDomain.createEvent();

// Effects
export const etcdConnectFx = etcdDomain.createEffect(setConnect);
export const etcdGetKeyFx = etcdDomain.createEffect(getKeys);
export const etcdPutKeyFx = etcdDomain.createEffect(saveNode);
export const etcdDisconnectFx = etcdDomain.createEffect(disconnect);
export const etcdNodeDeleteFx = etcdDomain.createEffect(deleteNode);

// Logic

sample({
  clock: etcdConnectFormSubmitted,
  fn: (form) => {
    const endpoints = form.endpoints.map(
      (endpoint) =>
        `${endpoint.protocol}${endpoint.host}${form.port && `:${form.port}`}`
    );
    return {
      endpoints,
      timeoutMs: Number(form.timeoutMs) || 1000,
    };
  },
  target: etcdConnectFx,
});

sample({
  clock: [
    EtcdGate.open,
    etcdConnectFx.done,
    etcdPutKeyFx.done,
    etcdNodeDeleteFx.done,
  ],
  target: etcdGetKeyFx,
});

$isConnected
  .on([etcdConnectFx.done, etcdGetKeyFx.done], () => true)
  .reset(etcdDisconnectFx.done);

$keys
  .on(etcdGetKeyFx.doneData, (_, payload) => {
    return payload.map((data) => ({
      ...data,
      value: JSON.parse(data.value),
    }));
  })
  .on(keyUpdated, (state, payload) => [...state, { key: payload, value: "" }])
  .reset(etcdDisconnectFx.done);
$selectedKeys.on(keySelected, (_, payload) => payload);

sample({
  clock: configSaved,
  target: etcdPutKeyFx,
});

sample({
  clock: etcdDisconnected,
  target: etcdDisconnectFx,
});

export const {
  $isOpen: $isEtcdConnectSettingOpen,
  openModal: openEtcdConnectSettingModal,
  closeModal: closeEtcdConnectSettingModal,
} = modalStateFactory({ domain: etcdDomain });

$isEtcdConnectSettingOpen.reset(etcdConnectFx.done);

export const {
  $isOpen: $isEtcdDeleteNodeOpen,
  openModal: openEtcdDeleteNodeModal,
  closeModal: closeEtcdDeleteNodeModal,
} = modalStateFactory<string>({ domain: etcdDomain });

$isEtcdDeleteNodeOpen.reset(etcdNodeDeleteFx.done);

$deleteNode.on(openEtcdDeleteNodeModal, (_, payload) => payload);

sample({
  clock: nodeDeleted,
  source: $deleteNode,
  fn: (sourceDeleteNode) => ({ key: sourceDeleteNode }),
  target: etcdNodeDeleteFx,
});

export const $loadingStatus = combine({
  etcdConnectLoading: etcdConnectFx.pending,
  etcdDisconnectLoading: etcdDisconnectFx.pending,
  etcdUpdateNodeLoading: etcdPutKeyFx.pending,
  etcdDeleteNodeLoading: etcdNodeDeleteFx.pending,
});
