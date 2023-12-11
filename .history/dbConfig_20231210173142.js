require("dotenv").config();
const {pool} = require('pg');

const isproduction = process.env.NODE_ENV === 'production';

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.}`