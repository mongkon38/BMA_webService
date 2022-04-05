
var https = require('https');
const express = require('express');
var cors = require('cors');
const pool = require('./pg_connect.js');
const { google } = require('googleapis');
const fs = require('fs');

var https_options = {
  cert: fs.readFileSync('./ssl/infraplus-ru.org.crt'),
  key: fs.readFileSync('./ssl/infraplus-ru.org.key'),
  ca: fs.readFileSync('./ssl/infraplus-ru.org.ca')
};

const app = express()
var server = https.createServer( https_options , app );
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use(cors())
const port = 4445
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/point', (req, res) => {
  db()
  async function db(){
    const client = await pool.connect()
    try{
      await client.query(`SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
                          FROM (SELECT 'Feature' As type , ST_AsGeoJSON(lg.geom)::json As geometry,
                                        row_to_json((SELECT l FROM (SELECT "Address", contact_number, "Note", "Date", "Group Name", people ) As l )) As properties 
                                FROM savelocation_07_mar_22_10_35_37_am As lg ) AS f`,
                    (err,result)=>{
        if (err){
          return res.json(err)
        } else {
          var result = result.rows[0]
          client.release()  
          return res.json(result)
        }
      })
    }
    catch(e){
      console.log(e)
    }
  }
})

app.get('/line', (req, res) => {
  db()
  async function db(){
    const client = await pool.connect()
    try{
      await client.query(` SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
                           FROM ( SELECT 'Feature' As type, st_asgeojson(st_makeline(geom))::json as geometry 
                                  FROM savelocation_07_mar_22_10_35_37_am ) AS f`,
                    (err,result)=>{
        if (err){
          return res.json(err)
        } else {
          var result = result.rows[0]
          result.features[0].properties = {}
          client.release()
          return res.json(result)
        }
      })
    }
    catch(e){
      console.log(e)
    }
  }
})

app.get('/bmaZone', (req, res) => {
  db()
  async function db(){
    const client = await pool.connect()
    try{
      await client.query(` SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
                           FROM (SELECT 'Feature' As type , ST_AsGeoJSON(lg.geom)::json As geometry,
                                        row_to_json((SELECT l FROM (SELECT  id,z_code, z_name, z_name_e, no_male, no_female,(no_male + no_female) pop, no_house, no_commu, z_area) As l )) As properties 
                                 FROM bma_zone As lg ) AS f`,
                    (err,result)=>{
        if (err){
          return res.json(err)
        } else {
          var result = result.rows[0]
          client.release()
          return res.json(result)
        }
      })
    }
    catch(e){
      console.log(e)
    }
  }
})

app.get('/district', (req, res) => {
  db()
  async function db(){
    const client = await pool.connect()
    try{
      await client.query(` SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
                           FROM (SELECT 'Feature' As type , ST_AsGeoJSON(lg.geom)::json As geometry,
                                        row_to_json((SELECT l FROM (SELECT  id, objectid, area, dcode, dname, dname_e, pcode, no_female, pname, no_male, no_health, no_temple, no_commu, no_hos, no_sch, (no_male + no_female) pop) As l )) As properties 
                                 FROM district As lg ) AS f`,
                    (err,result)=>{
        if (err){
          return res.json(err)
        } else {
          var result = result.rows[0]
          result.features[0].properties = {}
          client.release()
          return res.json(result)
        }
      })
    }
    catch(e){
      console.log(e)
    }
  }
})

app.get('/community', (req, res) => {
  db()
  async function db(){
    const client = await pool.connect()
    try{
      await client.query(` SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
                           FROM (SELECT 'Feature' As type , ST_AsGeoJSON(lg.geom)::json As geometry,
                                        row_to_json((SELECT l FROM (SELECT id, comm_id, name, dcode, scode, type, x, y) As l )) As properties 
                                  FROM community As lg ) AS f`,
                    (err,result)=>{
        if (err){
          return res.json(err)
        } else {
          var result = result.rows[0]
          client.release()
          return res.json(result)
        }
      })
    }
    catch(e){
      console.log(e)
    }
  }
})

app.get('/zone/:zoneId', (req, res) => {
  var zone = req.params.zoneId
  db()
  async function db(){
    const client = await pool.connect()
    try{
      await client.query(`SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
                           FROM (SELECT 'Feature' As type , ST_AsGeoJSON(geom)::json As geometry,
                                 row_to_json((SELECT l 
                                               FROM ( SELECT  id,z_code, z_name, z_name_e, no_male, no_female, no_house, no_commu, z_area) As l )) As properties 
                                 FROM bma_zone WHERE z_code = '${zone}'::text) AS f `,
                    (err,result)=>{
        if (err){
          return res.json(err)
        } else {
          var result = result.rows[0]
          client.release()
          return res.json(result)
        }
      })
    }
    catch(e){
      console.log(e)
    }
  }
})

app.get('/electionZone/:zone', (req, res) => {
  var zone = req.params.zone
  db()
  async function db(){
    const client = await pool.connect()
    try{
      await client.query(`SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
                          FROM (SELECT 'Feature' As type , ST_AsGeoJSON(geom)::json As geometry,
                                row_to_json((SELECT l 
                                              FROM ( SELECT  elction_z, "ชื่อถนน", length_1_dir, length_2_dir, num_sign_per_km ) As l )) As properties 
                                FROM sing_install_road_zone WHERE elction_z = ${zone} ) AS f  `,
                    (err,result)=>{
        if (err){
          return res.json(err)
        } else {
          var result = result.rows[0]
          client.release()
          return res.json(result)
        }
      })
    }
    catch(e){
      console.log(e)
    }
  }
})

//Google Sheets Service API 



app.get('/signSheets', async (req,res)=>{
  const { request, name } = req.body;

  const auth = new google.auth.GoogleAuth({
    keyFile:'signlocationsnode-bf2c0a5fb5f3.json',
    scopes:'https://www.googleapis.com/auth/spreadsheets'
  });

  const client = await auth.getClient();
  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "1Ojr7ZaMpIIVQhLp1iMkUZdBEEpHd3p6lUp7G_NKR6s0";

  // Get metadata about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "respone1"
  });

 const resData = getRows.data.values
 var Json = {
  "type": "FeatureCollection",
  "features": []
  }

 resData.forEach((data,i) => {
   var coor = []

   if (data[5] !== undefined){
       coor = [parseFloat(data[5].split(",")[0]),parseFloat(data[5].split(",")[1])]
   }

   if (i !== 0){
     if (data[5] !== undefined){
      Json.features.push(
        {
          "type": "Feature",
          "properties": {
            "timsStamp":data[0],
            "teamNum":data[1],
            "signType":data[2],
            "GeoStamp":data[4],
            "GeoAddress":data[6],
          },
          "geometry": {
            "type": "Point",
            "coordinates": [parseFloat(data[5].split(",")[1]),parseFloat(data[5].split(",")[0])]
          }
        }
      )
     }
    } 
 
 });
 //console.log(Json)
 res.send(Json)
 
})

server.listen(port, () => {
  console.log(`Start server at port ${port}`)
})