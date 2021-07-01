/* eslint-disable */

// this file contains everything that needs to be required
// so rollup can be happy.

const jquery = require('jquery');

window.$ = jquery;
window.jQuery = jquery;
window.moment = require('moment');
window.toastr = require('toastr');
window.bootbox = require('bootbox');
window.NoSleep = require('nosleep.js'); // we need to fix these to use the global jquery we included.

const dt = require('datatables.net')(window, jquery);

const dts = require('datatables.net-select')(window, jquery);

const dtsb4 = require('datatables.net-select-bs4')(window, jquery);

const dtb4 = require('datatables.net-bs4')(window, jquery);

const colreorder = require('datatables.net-colreorder')(window, jquery);

const colreorderbs4 = require('datatables.net-colreorder-bs4')(window, jquery);

const rowgroup = require('datatables.net-rowgroup')(window, jquery);

const rowgroupbs4 = require('datatables.net-rowgroup-bs4')(window, jquery);
