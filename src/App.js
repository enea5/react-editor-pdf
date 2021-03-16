import React, { useState, useCallback, useMemo } from 'react';
import ReactDOMServer from "react-dom/server"
import _ from 'lodash';
import { uuid } from 'lodash-uuid';

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
  ButtonGroup
} from '@material-ui/core';
// Material UI
import PictureAsPdf from '@material-ui/icons/PictureAsPdf';
import SubjectOutlinedIcon from '@material-ui/icons/SubjectOutlined';
import AddIcon from '@material-ui/icons/Add';

import './App.css';


const useAppbarStyles = makeStyles((theme) => ({
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

const useContentStyles = makeStyles((theme) => ({
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

  const appClasses = useAppbarStyles();
  const contentClasses = useContentStyles();

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
        const pageHeight = 290;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const heightLeft = imgHeight;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4')
        const position = 0;
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        pdf.save("download.pdf");
      });
  });
  const useDownloadHTML = useCallback((children) => {
    ReactDOMServer.renderToStaticMarkup(<>{children}</>)
  }, [])

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
            <IconButton color="inherit" aria-label="menu" onClick={onPrintDocument} disabled={chooseTab !== TAB_STATE.HTML_TAB_ID}>
              <SubjectOutlinedIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>

      <Container key={chooseTab} id="pdfdiv">
        <div className={contentClasses.root} >
          {chooseTab === TAB_STATE.EDIT_TAB_ID && (
            <Grid container spacing={3}>
              {colData.map((item) => (
                <Grid item xs={4} key={item.id}>
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
    </div>
  );
}

export default App;