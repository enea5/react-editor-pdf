import React from 'react'

import Box from "@material-ui/core/Box";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { toggleMark, isBlockActive, toggleBlock, isMarkActive } from 'helper/utils'
import { Editable, withReact, Slate, useSlate } from "slate-react";

const MarkButton = ({ format, children }) => {
  const editor = useSlate();
  return (
    <Box ml={1} mt={1}>
      <ToggleButton
        value={format}
        selected={isMarkActive(editor, format)}
        onMouseDown={event => {
          event.preventDefault();
          toggleMark(editor, format);
        }}
        style={{ lineHeight: 1 }}
      >
        {children}
      </ToggleButton>
    </Box>
  );
};
export default MarkButton;