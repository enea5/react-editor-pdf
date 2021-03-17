import React, { useState, useCallback, useMemo } from 'react';
import { uuid } from 'lodash-uuid';
import isHotkey from "is-hotkey";

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Editable, withReact, Slate, useSlate } from "slate-react";
import { createEditor, Editor, Transforms } from "slate";
import { withHistory } from "slate-history";

// Material UI
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  makeStyles,
  Button,
  Grid,
  TextField,
  ButtonGroup
} from '@material-ui/core';

import Box from "@material-ui/core/Box";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import CodeIcon from "@material-ui/icons/Code";
import LooksOneIcon from "@material-ui/icons/LooksOne";
import LooksTwoIcon from "@material-ui/icons/LooksTwo";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import ToggleButton from "@material-ui/lab/ToggleButton";
import Divider from "@material-ui/core/Divider";
// Material UI Icon
import PictureAsPdf from '@material-ui/icons/PictureAsPdf';
import SubjectOutlinedIcon from '@material-ui/icons/SubjectOutlined';
import AddIcon from '@material-ui/icons/Add';


import './App.css';
const LIST_TYPES = ["numbered-list", "bulleted-list"];
const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};


const appbarStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const contentStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  textfield: {
    padding: theme.spacing(2),
    width: '100%',
    color: theme.palette.text.secondary,
  },
  colunmnButton: {
    color: theme.palette.text.primary,
  }
}));


function App() {

  const TAB_STATE = useMemo(() => ({
    HTML_TAB_ID: 1,
    PDF_TAB_ID: 2,
    EDIT_TAB_ID: 3
  }), [])



  const [colData, setColData] = useState([])
  const [chooseTab, setChooseTab] = useState(TAB_STATE.EDIT_TAB_ID)

  const appClasses = appbarStyles();
  const contentClasses = contentStyles();

  const updateTextData = useCallback((e) => {
    const targetId = e.target.id;
    setColData(d => d.map(item => item.id === targetId ? { ...item, content: e.target.value } : item))
  }, [])

  const addRowCount = useCallback((e) => {
    setColData(d => [...d, {
      id: uuid(),
      content: ""
    }, {
      id: uuid(),
      content: ""
    }, {
      id: uuid(),
      content: ""
    }]);
  }, [])

  const onTABClick = useCallback((targetId) => {
    if (targetId === chooseTab) return;
    setChooseTab(targetId);
  }, [chooseTab])

  const onPrintDocument = useCallback(() => {
    const input = document.getElementById('pdfdiv');
    html2canvas(input)
      .then((canvas) => {
        const imgWidth = 200;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4')
        const position = 0;
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        pdf.save("download.pdf");
      });
  }, []);

  const onDownloadHTML = useCallback(() => {
    const doc = document.implementation.createHTMLDocument("DownloadDoc");
    const styles = document.getElementsByTagName('style');
    const newDiv = document.createElement('div');
    const newStyle = document.createElement('style');
    newDiv.innerHTML = document.getElementById('pdfdiv').innerHTML;

    let styleContent = '';
    for (const style of styles) {
      styleContent += style.innerHTML;
    }

    newStyle.innerHTML = styleContent;
    doc.head.appendChild(newStyle);
    doc.body.appendChild(newDiv);

    const tempEl = document.createElement('a');
    tempEl.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(doc.documentElement.innerHTML);
    tempEl.target = '_blank';
    tempEl.download = 'page.html';
    tempEl.click();
  }, []);

  const [inputValue, setInputValue] = useState([{
    type: "paragraph",
    children: [{ text: "" }]
  }]);

  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);


  return (
    <div>
      <div className={appClasses.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={appClasses.title}>
              Generate HTML & PDF
            </Typography>
            <ButtonGroup variant="contained" color="primary">
              <Button id={TAB_STATE.EDIT_TAB_ID} onClick={() => onTABClick(TAB_STATE.EDIT_TAB_ID)} >EDIT</Button>
              <Button id={TAB_STATE.HTML_TAB_ID} onClick={() => onTABClick(TAB_STATE.HTML_TAB_ID)} >HTML</Button>
            </ButtonGroup>
            <IconButton color="inherit" aria-label="menu" onClick={onPrintDocument} disabled={chooseTab !== TAB_STATE.HTML_TAB_ID}>
              <PictureAsPdf />
            </IconButton>
            <IconButton color="inherit" aria-label="menu" onClick={onDownloadHTML} disabled={chooseTab !== TAB_STATE.HTML_TAB_ID}>
              <SubjectOutlinedIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>

      <Slate
        editor={editor}
        value={inputValue}
        onChange={value => {
          setInputValue(value);
        }}
      >
        <Toolbar>
          <MarkButton format="bold">
            <FormatBoldIcon />
          </MarkButton>
          <MarkButton format="italic">
            <FormatItalicIcon />
          </MarkButton>
          <MarkButton format="underline">
            <FormatUnderlinedIcon />
          </MarkButton>
          <MarkButton format="code">
            <CodeIcon />
          </MarkButton>
          <BlockButton format="heading-one">
            <LooksOneIcon />
          </BlockButton>
          <BlockButton format="heading-two">
            <LooksTwoIcon />
          </BlockButton>
          <BlockButton format="block-quote">
            <FormatQuoteIcon />
          </BlockButton>
          <BlockButton format="numbered-list">
            <FormatListNumberedIcon />
          </BlockButton>
          <BlockButton format="bulleted-list">
            <FormatListBulletedIcon />
          </BlockButton>
        </Toolbar>
        <Container key={chooseTab} id="pdfdiv">
          <div className={contentClasses.root} >
            {chooseTab === TAB_STATE.EDIT_TAB_ID && (
              <Grid container spacing={3}>
                {colData.map((item) => (
                  <Grid item xs={4} key={item.id}>
                    <Editable
                      renderElement={renderElement}
                      renderLeaf={renderLeaf}
                      placeholder="Enter some rich text…"
                      spellCheck
                      autoFocus
                      onKeyDown={event => {
                        for (const hotkey in HOTKEYS) {
                          if (isHotkey(hotkey, event)) {
                            event.preventDefault();
                            const mark = HOTKEYS[hotkey];
                            toggleMark(editor, mark);
                          }
                        }
                      }}
                    />
                    <TextField
                      id={item.id}
                      placeholder="input the text"
                      className={contentClasses.textfield}
                      value={item.content}
                      onChange={updateTextData}
                      multiline
                    />
                  </Grid>
                ))}
                <Grid item sm={12}>
                  <Button variant="contained" color="primary" href="#contained-buttons" onClick={addRowCount}>
                    <AddIcon></AddIcon>Add Column
                </Button>
                </Grid>
              </Grid>
            )}
            {chooseTab === TAB_STATE.HTML_TAB_ID && (
              <Grid container spacing={3}>
                {colData.map((item) => (
                  <Grid item xs={4} key={item.id}>
                    <p >
                      {item.content.split('\n').map((c, i) => (
                        <React.Fragment key={i}>{c}<br /></React.Fragment>
                      ))}
                    </p>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
        </Container>
      </Slate>
    </div>
  );
}

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
const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });
  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};
const BlockButton = ({ format, children }) => {
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


const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export default App;