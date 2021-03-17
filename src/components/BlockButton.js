import React from 'react'
import Box from "@material-ui/core/Box";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { toggleMark, isBlockActive, toggleBlock, isMarkActive } from 'helper/utils'
import { Editable, withReact, Slate, useSlate } from "slate-react";

export default function BlockButton ({ format, children }) {
  const editor = useSlate();
  return (
    <Box ml={1} mt={1}>
      <ToggleButton
        value={format}
        selected={isBlockActive(editor, format)}
        onMouseDown={event => {
          event.preventDefault();
          toggleBlock(editor, format);
        }}
        style={{ lineHeight: 1 }}
      >
        {children}
      </ToggleButton>
    </Box>
  );
};
