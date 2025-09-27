import {
  $deleteNode,
  $isEtcdDeleteNodeOpen,
  $loadingStatus,
  closeEtcdDeleteNodeModal,
  nodeDeleted,
} from "@/models/etcd";
import { Button, Flex, Modal } from "antd";
import { useUnit } from "effector-react";

export const DeleteModal = () => {
  const [isEtcdDeleteNodeOpen, deleteNode, loadingStatus] = useUnit([
    $isEtcdDeleteNodeOpen,
    $deleteNode,
    $loadingStatus,
  ]);

  return (
    <Modal
      title={`Удалить настройки для ${deleteNode}`}
      closable={{ "aria-label": "Custom Close Button" }}
      open={isEtcdDeleteNodeOpen}
      onCancel={() => closeEtcdDeleteNodeModal()}
      // onOk={() => closeEtcdConnectSettingModal()}
      footer={
        <Flex justify="end" gap="small">
          <Button
            color="danger"
            variant="solid"
            onClick={() => nodeDeleted()}
            disabled={loadingStatus.etcdDeleteNodeLoading}
            loading={loadingStatus.etcdDeleteNodeLoading}
          >
            Удалить
          </Button>
          <Button
            type="default"
            onClick={() => closeEtcdDeleteNodeModal()}
            disabled={loadingStatus.etcdDeleteNodeLoading}
            loading={loadingStatus.etcdDeleteNodeLoading}
          >
            Отменить
          </Button>
        </Flex>
      }
    ></Modal>
  );
};
