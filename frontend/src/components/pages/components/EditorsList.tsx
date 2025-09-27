import { useUnit } from "effector-react";
import { $keys, $selectedKeys } from "../../../models/etcd";
import { Editor } from "./Editor";

import { Flex } from "antd";
import { useEffect, useMemo, useRef } from "react";
import * as jsondiffpatch from "jsondiffpatch";
import * as htmlFormatter from "jsondiffpatch/formatters/html";
import "jsondiffpatch/formatters/styles/html.css";

interface Props {
  editKeys: {
    key: string;
    value: string;
  }[];
}

export const EditorsList = ({ editKeys }: Props) => {
  // const [keys, selectedKeys] = useUnit([$keys, $selectedKeys]);

  // const diffRef = useRef<HTMLDivElement | null>(null);
  // const editKeys = useMemo(
  //   () => keys?.filter((k) => selectedKeys.has(k.key)) ?? [],
  //   [keys, selectedKeys]
  // );

  // useEffect(() => {
  //   const el = diffRef.current;
  //   if (!el) return;

  //   if (editKeys.length < 2) {
  //     el.innerHTML = "";
  //     return;
  //   }

  //   const left = editKeys[0]?.value;
  //   const right = editKeys[1]?.value;

  //   if (left == null || right == null) {
  //     el.innerHTML = "";
  //     return;
  //   }

  //   const delta = jsondiffpatch.diff(left, right);

  //   if (!delta) {
  //     el.innerHTML = "";
  //     return;
  //   }

  //   el.innerHTML = htmlFormatter.format(delta, left) ?? "";
  // }, [editKeys]);

  // return editKeys?.map((editKey, index) => {
  //   return <Editor key={editKey.key} node={editKey} index={index} />;
  // })

  console.log("editKey", editKeys);

  return (
    <Flex gap="1px">
      {editKeys.map((editKey, index) => {
        return <Editor key={editKey.key} node={editKey} index={index} />;
      })}
      {/* <div ref={diffRef}></div> */}
    </Flex>
  );
};
