var express = require('express');
var handleBars =  require('handleBars');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');