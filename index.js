const path = require("path");

const express = require("express");
const fs = require("fs");

const multer = require("multer");
const { marked } = require("marked");

const { Client: datomsClient } = require("datomspace");

const datomSpaceServerName = "My_Personal_Data_Space"; // the default personal data space name
const datom_name = "banks";  // the default data type

const app = express();
const port = process.env.PORT || 3000;

const router = express.Router();

async function start() {
  const datomsclient = new datomsClient({
    host: datomSpaceServerName,
  });

  console.log(`${datomSpaceServerName} are ready...`);

  //fetch datoms using name or key
  const datomStore = await datomsclient.corestore();
  const datom = datomStore.get({
    name: datom_name,
    valueEncoding: "json",
  });

  let datomData = [];
  const datajsonfile_url = './data/'+`${datom_name}`+'.json'
  datom
    .createReadStream()
    .on("data", (res) => {
      datomData.push(res);
    })
    .on("end", () => {
      fs.writeFile(
        datajsonfile_url,
        JSON.stringify(datomData),
        "utf8",
        (err) => {
          if (err) {
            console.log(
              "An error occured while writing JSON Object to File.",
              err
            );
          } else {
            console.log("datom data has been save to local JSON File.");
          }
        }
      );
    });

  /*
  // clone datom to local storage

  const clone = toPromises(new datom('./clone', {
    name: datom_name,
    valueEncoding: 'json',
    sparse: true,
  }))
*/

  datomsclient.network.configure(datom.discoveryKey, {
    announce: true,
    lookup: true,
  });

  /* todo

  add code to verify the datoms is the correct datoms using credentials.


  */

  //front-end show the datoms data.
  //app.set("view engine", "pug")
  //app.set("views", path.join(__dirname, "views"))

  app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/index.html"));
  });

  app.get("/api/datoms", function (req, res) {
    let jsonData = require(datajsonfile_url);
    res.send(jsonData);
  });

  app.get("/api/datoms/result", function (req, res) {
    let jsonData = require(datajsonfile_url);
    let balanceSum = 0;
    jsonData.map((item) => {
      balanceSum += item.balance * 1;
    });
    res.send({ sum: balanceSum });
  });

  router.get("/fetch_datoms", function (req, res) {
    res.sendFile(path.join(__dirname + "/fetch_datoms.html"));
  });

  router.get("/compute_result", function (req, res) {
    res.sendFile(path.join(__dirname + "/compute_result.html"));
  });

  //add the router
  app.use("/", router);
  app.listen(process.env.port || 3000);

  console.log("Running at Port 3000");

  /* todo

add code to add banks account balance.

if the total balance is up to 1000, output "the bank balance is over 1000." 
or  "the bank balance is below 1000"

*/
}

start();
