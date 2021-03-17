import React, { useState, useCallback, useMemo } from 'react';
import { uuid } from 'lodash-uuid';
import _ from 'lodash';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  ButtonGroup,
  Paper
} from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
// Material UI
import PictureAsPdf from '@material-ui/icons/PictureAsPdf';
import SubjectOutlinedIcon from '@material-ui/icons/SubjectOutlined';
import AddIcon from '@material-ui/icons/Add';
import './App.css';
import RichEditor from 'components/RichEditor';
import ReadOnly from 'components/ReadOnly';


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
    paddingTop: '40px'
  },
  textfield: {
    width: '100%',
    color: theme.palette.text.secondary,
  },
  colunmnButton: {
    color: theme.palette.text.primary,
  },
  spacing: 4
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

  const addRowCount = useCallback((e) => {
    setColData(d => [...d, {
      id: uuid(),
      content: [{
        type: "paragraph",
        children: [{ text: "" }]
      }]
    }, {
      id: uuid(),
      content: [{
        type: "paragraph",
        children: [{ text: "" }]
      }]
    }, {
      id: uuid(),
      content: [{
        type: "paragraph",
        children: [{ text: "" }]
      }]
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
  //  choose handle
  const [chooseItemId, setChooseItemId] = useState('')
  const [chooseInput, setChooseInput] = useState([{
    type: "paragraph",
    children: [{ text: "" }]
  }]);

  const handleTextEditorClick = useCallback((targetId) => {
    const item = _.find(colData, { id: targetId });
    if (item) {
      setChooseItemId(item.id);
      setChooseInput(item.content)
    }
  }, [colData])

  const handleUpdateChooseText = useCallback((value) => {
    if (chooseItemId) {
      setColData(d => d.map(item => item.id === chooseItemId ? { ...item, content: value } : item))
    }
    setChooseInput(value)
  }, [chooseItemId])
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

      <Container className={contentClasses.root}>
        <Grid container spacing={2}>

          <Grid item xs={9} spacing={2}>
            <Card variant="outlined">
              <CardContent id="pdfdiv" elevation={3} style={{ padding: '20px' }}>
                <div>
                  <Grid container spacing={3}>
                    {colData.map((item) => (
                      <Grid item xs={4} key={item.id} onClick={() => handleTextEditorClick(item.id)}>
                        <ReadOnly
                          initialValue={item.content}
                          borderSize={(chooseTab === TAB_STATE.EDIT_TAB_ID) ? 1 : 0}
                        />
                      </Grid>
                    ))}
                    {chooseTab === TAB_STATE.EDIT_TAB_ID && (
                      <Grid item sm={12}>
                        <Button variant="contained" color="primary" href="#contained-buttons" onClick={addRowCount}>
                          <AddIcon></AddIcon>Add Column
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3} spacing={3} style={{ padding: '20px' }}>
            <Paper elevation={3}>
              {!!chooseItemId && <RichEditor value={chooseInput} setValue={handleUpdateChooseText} ></RichEditor>}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div >
  );
}

export default App;