import { useEffect, useRef, useState } from "react";
import JSONEditor, { type JSONEditorMode } from "jsoneditor";
import type { Key } from "../../../services/etcdService";
import styles from "./styles.module.scss";
import { Button, Form } from "antd";
import { $loadingStatus, configSaved } from "../../../models/etcd";
import { useUnit } from "effector-react";

type Props = {
  index: number;
  node: Key;
};

export const Editor = ({ node, index }: Props) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const modes = ["code", "text", "tree", "view"] as JSONEditorMode[];

  const [loadingStatus] = useUnit([$loadingStatus]);

  const [data, setData] = useState<object | string>({});
  const [canSave, setCanSave] = useState<boolean>(false);

  useEffect(() => {
    const container = elRef.current;

    const options = {
      modes: modes,
      onChange: handleChange,
    };

    console.log("container", container);

    if (container) {
      container.innerHTML = "";
    }

    if (container) {
      const jsonEditor = new JSONEditor(container, options);

      editorRef.current = jsonEditor;

      jsonEditor.set(node.value);
    }

    return () => {
      elRef.current = null;
    };
  }, [node]);

  const cancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (editorRef.current !== null) {
      editorRef?.current?.set(node?.value || {});
    }
    setCanSave(false);
  };

  const handleChange = () => {
    const data = editorRef?.current?.get();
    if (!canSave && JSON.stringify(data) !== JSON.stringify(node?.value)) {
      setCanSave(true);
    } else {
      setCanSave(false);
    }
    if (!data) {
      setData("null");
    } else {
      setData(data);
    }
  };

  const onFinish = () => {
    configSaved({ key: node.key, node: { value: data } });
    setCanSave(false);
  };

  return (
    <>
      <Form onFinish={onFinish} className={styles.form}>
        <>
          <h3 className={styles.editorTitle}>{node?.key}</h3>
          <div
            className={styles.editorContainer}
            id={`$jsoneditor_${index}`}
            ref={elRef}
          />
        </>
        <div className={styles.actionContainer}>
          <Button
            variant="filled"
            color="danger"
            onClick={cancel}
            disabled={!canSave || loadingStatus.etcdUpdateNodeLoading}
            loading={loadingStatus.etcdUpdateNodeLoading}
          >
            Отменить
          </Button>
          <Button
            htmlType="submit"
            disabled={!canSave || loadingStatus.etcdUpdateNodeLoading}
            loading={loadingStatus.etcdUpdateNodeLoading}
          >
            Сохранить конфиг
          </Button>
        </div>
      </Form>
    </>
  );
};
