require("dotenv").config();
const app = require("express")();
const bodyParser = require("body-parser");
const Excel = require("exceljs")
const axios = require("axios");

const excelToJson = require("convert-excel-to-json");

const fs = require('fs')
const cors = require("cors");
const fileUpload = require("express-fileupload");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

const stylesExcel = require('./excel-styles')

app.get("api/download/:filename", function (req, res) {
  const path = `${__dirname}/files/${req.params.filename}`
  res.download(path)
})

app.post("api/upload", async function (req, res) {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No hay archivos");
    }
    // Nombre del Archivo
    const sampleFile = req.files.file;
    const uploadPath = `${__dirname}/files/${sampleFile.name}`;

    // Usar mv() para mover el archivo a otro Path
    await sampleFile.mv(uploadPath)

    const dataTable = []

    const { Sheet1 } = excelToJson({ sourceFile: uploadPath });

    Sheet1.shift();
    var workbook = new Excel.Workbook();
    var ws = workbook.addWorksheet("Coordenadas y Direcciones");
    workbook.creator = "vera8german@gmail.com";
    workbook.lastModifiedBy = new Date();
    workbook.created = new Date();
    ws.state = "visible";
    const cols = ['Direcciones', 'Coordenada Lat', 'Coordenada Lng']
    for (const i in cols) {
      ws.getRow(1).getCell(parseInt(i) + 1).fill = stylesExcel.headerFill;
      ws.getRow(1).getCell(parseInt(i) + 1).font = stylesExcel.subHeaderFont;
      ws.getRow(1).getCell(parseInt(i) + 1).alignment = stylesExcel.alignmentHeader;
      ws.getRow(1).getCell(parseInt(i) + 1).value = cols[i];

      ws.getColumn(parseInt(i) + 1).width = 27;
      ws.getColumn(parseInt(i) + 1).key = cols[i];
      // }
    }
    for (let i of Sheet1) {
      const { data } = await client.geocode(
        {
          params: {
            address: i.A,
            key: process.env.API_KEY
          },
          timeout: 1000
        },
        axios
      );
      ws.addRow([
        i.A,
        data.results[0].geometry.location.lat,
        data.results[0].geometry.location.lng
      ]);
      dataTable.push({
        address: i.A,
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng
      })
    }
    await workbook.xlsx.writeFile(`${__dirname}/files/coordenadas.xlsx`);
    res.send({ filename: 'coordenadas.xlsx', data: dataTable });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: 'Error' });
  }
});


app.listen(5000, () => console.log("Servicio activo en puerto:", 5000));
