import { createDomain } from "effector";
import type { Domain } from "effector";

interface Params {
  domain?: Domain;
  defaultIsOpen?: boolean;
}

export function modalStateFactory<OpenEventPayload = void>(params?: Params) {
  const { domain = createDomain(), defaultIsOpen = false } = params || {};
  const openModal = domain.createEvent<OpenEventPayload>();
  const closeModal = domain.createEvent<void>();
  const $isOpen = domain.createStore<boolean>(defaultIsOpen);

  $isOpen.on(openModal, () => true).on(closeModal, () => false);

  return {
    $isOpen,
    openModal,
    closeModal,
  };
}
