import { useUnit } from "effector-react";
import {
  $keys,
  $selectedKeys,
  keySelected,
  keyUpdated,
  openEtcdDeleteNodeModal,
} from "../../../models/etcd";
import { Button, Flex, Form, Input, type FormProps } from "antd";
import { useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { DeleteModal } from "./deleteModal/DeleteModal";
import styles from "./styles.module.scss";
type FieldType = {
  nodeName: string;
};

export const KeysList = () => {
  const [keys, selectedKeys] = useUnit([$keys, $selectedKeys]);

  const [isAddNewNode, setAddNewNode] = useState(false);

  const updateSelected = (key: string) => {
    const newSelectedNodes = new Set(selectedKeys);
    if (newSelectedNodes.has(key)) {
      newSelectedNodes.delete(key);
    } else {
      if (newSelectedNodes.size < 2) {
        newSelectedNodes.add(key);
      }
    }
    keySelected(newSelectedNodes);
  };

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    keyUpdated(values.nodeName);
    setAddNewNode(false);
  };

  const allKeys = keys.map((key) => key.key);

  console.log("keys", keys);

  const [form] = Form.useForm();
  console.log(
    "form",
    Form.useWatch((val) => val.nodeName)
  );

  const customValue = Form.useWatch((values) => values.nodeName || "", form);
  console.log("customValue", customValue);

  return (
    <>
      <Flex
        vertical
        gap="small"
        style={{
          // flex: "1 1 auto",
          overflow: "auto",
          paddingTop: 10,
          paddingBottom: 10,
          height: "calc(100vh - 80px)",
        }}
      >
        {keys && keys?.length > 0
          ? keys.map((key) => (
              <Flex gap="middle" justify="space-between">
                <Button
                  onClick={() => updateSelected(key.key)}
                  style={{ width: "100%" }}
                  variant={selectedKeys.has(key.key) ? "filled" : "outlined"}
                  color={selectedKeys.has(key.key) ? "lime" : "default"}
                  // disabled={isAddNewNode}
                >
                  {key.key}
                </Button>
                <DeleteOutlined
                  style={{ color: "#ff4d4f", fontSize: 20, cursor: "pointer" }}
                  onClick={() => {
                    openEtcdDeleteNodeModal(key.key);
                  }}
                />
              </Flex>
            ))
          : ""}
        {isAddNewNode ? (
          <Form
            name="basic"
            form={form}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              name="nodeName"
              rules={[{ required: true, message: "Введите название" }]}
            >
              <Input
                variant="borderless"
                placeholder="Название ноды"
                style={{
                  color: "#fff",
                  borderBottom: "1px solid #a0d911",
                }}
                className={styles.test}
              />
            </Form.Item>

            <Form.Item>
              <Flex gap="small">
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={allKeys.includes(customValue)}
                >
                  Сохранить
                </Button>
                <Button
                  color="danger"
                  variant="filled"
                  onClick={() => setAddNewNode(false)}
                >
                  Отменить
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        ) : (
          <Flex>
            <Button
              color="lime"
              variant="filled"
              onClick={() => setAddNewNode(true)}
            >
              Добавить
            </Button>
          </Flex>
        )}
      </Flex>
      <DeleteModal />
    </>
  );
};
