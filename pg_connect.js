const { Pool } = require('pg')

const pool = new Pool({
    user:"postgres",
	host:"122.155.170.120",
	database:"householdvisit",
	password:"postgres@ru1234",
	port:5432,
	ssl: false
})

module.exports = pool;
	
