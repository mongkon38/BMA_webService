
const express = require('express')
var cors = require('cors')
const pool = require('./pg_connect.js')

const app = express()

app.use(cors())
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
                                        row_to_json((SELECT l FROM (SELECT  id,z_code, z_name, z_name_e, no_male, no_female, no_house, no_commu, z_area) As l )) As properties 
                                 FROM bma_zone As lg ) AS f`,
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

app.get('/district', (req, res) => {
  db()
  async function db(){
    const client = await pool.connect()
    try{
      await client.query(` SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features 
                           FROM (SELECT 'Feature' As type , ST_AsGeoJSON(lg.geom)::json As geometry,
                                        row_to_json((SELECT l FROM (SELECT  id, objectid, area, dcode, dname, dname_e, pcode, no_female, pname, no_male, no_health, no_temple, no_commu, no_hos, no_sch) As l )) As properties 
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
    
app.listen(4005, () => {
  console.log('Start server at port 4005.')
})