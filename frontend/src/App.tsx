import { useEffect, useMemo, useRef, useState } from "react";
import "./App.scss";
import JSONEditor from "jsoneditor";
import * as jsondiffpatch from "jsondiffpatch";
// import "jsondiffpatch/formatters/styles/html.css";
import * as htmlFormatter from "jsondiffpatch/formatters/html";
import * as annotatedFormatter from "jsondiffpatch/formatters/annotated";
import "jsondiffpatch/formatters/styles/html.css";
import { useGate, useUnit } from "effector-react";
import {
  $isConnected,
  $isEtcdConnectSettingOpen,
  $keys,
  $loadingStatus,
  $selectedKeys,
  closeEtcdConnectSettingModal,
  etcdConnectFormSubmitted,
  etcdDisconnected,
  EtcdGate,
  openEtcdConnectSettingModal,
  type EtcdConnectForm,
} from "./models/etcd";
import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Select,
  type FormProps,
  type MenuProps,
} from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import React from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { KeysList } from "./components/pages/components/KeysList";
import { EditorsList } from "./components/pages/components/EditorsList";

function App() {
  useGate(EtcdGate);

  const [
    isConnected,
    keys,
    isEtcdConnectSettingOpen,
    selectedKeys,
    loadingStatus,
  ] = useUnit([
    $isConnected,
    $keys,
    $isEtcdConnectSettingOpen,
    $selectedKeys,
    $loadingStatus,
  ]);

  const isShowDifferenceBlock = selectedKeys.size > 1;

  const diffRef = useRef<HTMLDivElement | null>(null);
  const editKeys = useMemo(
    () => keys?.filter((k) => selectedKeys.has(k.key)) ?? [],
    [keys, selectedKeys]
  );

  useEffect(() => {
    const el = diffRef.current;
    if (!el) return;

    if (editKeys.length < 2) {
      el.innerHTML = "";
      return;
    }

    const left = editKeys[0]?.value;
    const right = editKeys[1]?.value;

    if (left == null || right == null) {
      el.innerHTML = "";
      return;
    }

    const delta = jsondiffpatch.diff(left, right);

    if (!delta) {
      el.innerHTML = "";
      return;
    }

    el.innerHTML = htmlFormatter.format(delta, left) ?? "";
  }, [editKeys]);

  const onFinish: FormProps<EtcdConnectForm>["onFinish"] = (values) => {
    etcdConnectFormSubmitted(values);
  };

  const { Option } = Select;

  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(true);
  return (
    <>
      <Layout>
        <Layout>
          <Sider
            width={260}
            style={{ padding: "10px", borderRight: "2px solid #ebebeb" }}
          >
            <Flex vertical align="space-between" style={{ height: "100vh" }}>
              <Button onClick={() => openEtcdConnectSettingModal()}>
                Подключиться к ETCD
              </Button>
              {isConnected ? (
                <KeysList />
              ) : (
                <div
                  style={{
                    height: "calc(100vh - 80px)",
                  }}
                />
              )}
              <Button
                onClick={() => etcdDisconnected()}
                color="danger"
                variant="filled"
                loading={loadingStatus.etcdDisconnectLoading}
                disabled={loadingStatus.etcdDisconnectLoading}
              >
                Отключиться
              </Button>
            </Flex>
          </Sider>
          <Layout>
            <Content
              style={{
                // padding: 24,
                margin: 0,
                // height: "calc(100vh - 88px)",
                height: "100vh",
              }}
            >
              <EditorsList editKeys={editKeys} />
            </Content>
          </Layout>
          {isShowDifferenceBlock && (
            <Sider
              collapsible
              collapsed={collapsed}
              onCollapse={(value) => setCollapsed(value)}
              collapsedWidth={300}
              width={28}
              style={{
                overflow: "scroll",
                backgroundColor: "#fff",
                height: "calc(100vh - 50px)",
              }}
            >
              <div ref={diffRef}></div>
            </Sider>
          )}
        </Layout>
      </Layout>
      <Modal
        title="Настройки подключение к ETCD"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isEtcdConnectSettingOpen}
        onCancel={() => closeEtcdConnectSettingModal()}
        footer={
          <Button onClick={() => closeEtcdConnectSettingModal()}>
            Закрыть
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          name="basic"
          style={{ maxWidth: 600 }}
          initialValues={{ endpoints: [""], port: "", timeoutMs: "" }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.List name="endpoints">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => {
                  return (
                    <Form.Item
                      label={index === 0 ? "Сервер" : ""}
                      required={false}
                      key={field.key}
                    >
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => (
                          <Form.Item
                            {...field}
                            validateTrigger={["onChange", "onBlur"]}
                            name={[field.name, "host"]}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: "Введите адрес сервера",
                              },
                              {
                                pattern:
                                  /^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[\/?#][-a-zA-Z0-9()@:%_\+.~#?&\/=]*)?$/,
                                message: "Адрес не соответствует URL  ",
                              },
                            ]}
                            noStyle
                          >
                            <Flex gap="small">
                              <Input
                                addonBefore={
                                  <Form.Item
                                    name={[field.name, "protocol"]}
                                    noStyle
                                    initialValue="http://"
                                  >
                                    <Select style={{ width: 90 }}>
                                      <Option value="http://">http://</Option>
                                      <Option value="https://">https://</Option>
                                    </Select>
                                  </Form.Item>
                                }
                                addonAfter={
                                  getFieldValue("port") &&
                                  `:${getFieldValue("port")}`
                                }
                                placeholder="Адрес сервера"
                                style={{ width: "100%" }}
                              />
                              {fields.length > 1 ? (
                                <MinusCircleOutlined
                                  className="dynamic-delete-button"
                                  onClick={() => remove(field.name)}
                                />
                              ) : null}
                            </Flex>
                          </Form.Item>
                        )}
                      </Form.Item>
                    </Form.Item>
                  );
                })}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    style={{ width: "60%" }}
                    icon={<PlusOutlined />}
                  >
                    Добавить сервер
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item<EtcdConnectForm> label="Порт" name="port">
            <Input placeholder="Порт" />
          </Form.Item>
          <Form.Item<EtcdConnectForm>
            label="Время подключения"
            name="timeoutMs"
          >
            <Input placeholder="Время подключения" />
          </Form.Item>
          <Form.Item label={null}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingStatus.etcdConnectLoading}
              disabled={loadingStatus.etcdConnectLoading}
            >
              Подключиться
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default App;
