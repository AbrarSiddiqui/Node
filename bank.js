const express = require("express");
const app = express();
const fs = require("fs");
const uuid = require("uuid");
const crypto = require("crypto");
const yargs = require("yargs");
const { generateKeyPair } = require("crypto");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let customers = [];
let initialvalue = 0;
let flag = true;
let checker = 0;
let authfilecontent;
let auth_fileName;

/* command line arguments are handled */

const argument = yargs
  .option("port", {
    alias: "p",
    description: "port number",
    type: "array",
    default: ["3000"]
  })
  .option("auth", {
    alias: "s",
    description: "auth file",
    type: "array",
    default: ["bank.auth"]
  })
  .option("parent", {
    alias: "x",
    description: "parent path",
    type: "string"
  })

  .help()
  .alias("help", "h").argv;

if (argument._.length > 0) {
  //console.log("Redundent Arguments");
  systemError(255);
}

if (argument.port) {
  if (argument.port.length > 1) {
    systemError(255);
  } else if (argument.port[0].toString().length > 4096) systemError(255);
}
let authExt = ".auth";
if (argument.auth) {
  if (argument.auth.length > 1) {
    systemError(255);
  } else if (argument.auth[0].toString().length > 4096) systemError(255);
  else if (argument.auth[0] == "." || argument.auth[0] == "..") {
    systemError(255);
  }
  if (!argument.auth[0].toString().includes(".auth")) {
    authExt += ".auth";
    argument.auth[0] = authExt;
  }

  var reg = /^[_\-\.0-9a-z]{1,255}$/;
  // var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  //   auth_fileName = format.test(argument.auth[0])
  //     ? {
  //     console.log(argument.parent);
  //     systemError(255)}
  //     : argument.auth[0] + ".auth";
  // }
  if (!reg.test(argument.auth[0].toString())) {
    //console.log("Auth file name invalid");
    systemError(255);
  }
}
reg = /^[1-9][0-9]{3,4}$/;
if (argument.port[0] != "") {
  if (
    !reg.test(argument.port[0].toString()) ||
    parseInt(argument.port[0]) <= 1024 ||
    parseInt(argument.port[0]) >= 65535
  ) {
    //console.log("Port is invalid");
    systemError(255);
  }
}
//auth_fileName = auth_fileName || "bank.auth";
bank_start(argument.auth[0]);
app.listen(argument.port[0]);
//console.log("server running   " + port);

// if (checker === 0) { generatePrivatePublicKeyPair() }

//Here all the web requests are handled

app.post("/new", function(req, resp) {
  //console.log("in new account");
  /***************************************************
   * Following handles the request for new account creation:
   * First we decrypt the User data using RSA PrivateKey
   * then response is send it the ATM via trusted channel
   **************************************************/

  // let encrypteddata = req.body.encrypteddata;
  // let decrypted_data = decryptStringWithRsaPrivateKey(encrypteddata);
  // decrypted_data = JSON.parse(decrypted_data);

  // if (decrypted_data.bank_authkey === authfilecontent) {
  //   //console.log("successfully authenticated");
  // } else {

  //   console.log(255);
  //   resp.send({
  //     output: "security breached"
  //   });

  // }
  let { name, account, initial_balance, cardfile } = req.body;
  initial_balance = parseFloat(initial_balance);
  req.body.initial_balance = initial_balance;
  req.body.total_balance = initial_balance;
  let current_customer = [];

  // this if executes only for first query, when authentication succeed

  if (initialvalue === 0) {
    customers.push(req.body);
    current_customer.push(req.body);
    initialvalue++;
  } else {
    /*****************************************************************
     * Following code checks whether this account already exists or not
     * from the  customers array, accordingly request is handled
     *  and current customer response sent to Atm
     *******************************************************************/
    for (let i = 0; i < customers.length; i++) {
      if (account === customers[i].account) {
        checker = -1;
        flag = !flag;
        //console.log(customers[i].account);
        resp.send({
          output: "account already exist"
        });
        break;
      }
    }
    if (checker != -1) {
      customers.push(req.body);
      current_customer.push(req.body);
    } else {
      checker = 0;
    }
  }
  if (flag) {
    resp.send({
      output: current_customer
    });
    console.log(
      `{"account":"${current_customer[0].account}","initial_balance":${current_customer[0].initial_balance}}`
    );
    // console.log(
    //   `{"initial_balance": ${current_customer[0].initial_balance}, "account": "${current_customer[0].account}"}`
    // );
  } else {
    flag = !flag;
  }
});

app.post("/deposit", function(req, resp) {
  /***************************************************
   * Following handles the request for deposit:
   * First we decrypt the User data using RSA PrivateKey
   * then response is send it the ATM via trusted channel
   **************************************************/
  // let encrypteddata = req.body.encrypteddata;
  // let decrypted_data = decryptStringWithRsaPrivateKey(encrypteddata);
  // decrypted_data = JSON.parse(decrypted_data);
  let newflag = true;

  // if (!(decrypted_data.bank_authkey === authfilecontent)) {
  //   console.log("security breached");
  //   console.log(255);
  //   resp.send({
  //     output: "security breached"
  //   });
  // }
  let { account, deposit_amount, cardfile } = req.body;

  /*****************************************************************
   * Following code checks for the account into customers array
   * if it founds this, then for that client total_balance is updated
   *  and deposit balance response sent to Atm
   *******************************************************************/

  for (let i = 0; i < customers.length; i++) {
    if (
      account === customers[i].account &&
      cardfile === customers[i].cardfile
    ) {
      customers[i].total_balance =
        parseFloat(customers[i].total_balance) + parseFloat(deposit_amount);
      resp.send({
        account: account,
        deposit_amount: deposit_amount,
        total_balance: customers[i].total_balance
      });
      console.log(
        `{"account":"${customers[i].account}","deposit":${deposit_amount}}`
      );
      // console.log(
      //   `{"deposit": ${deposit_amount}, "account": "${customers[i].account}"}`
      // );
      newflag = !newflag;
      break;
    }
  }
  if (newflag) {
    resp.send({
      output: "account does not match"
    });
  } else {
    newflag = !newflag;
  }
});

app.post("/withdraw", function(req, resp) {
  /**********************************************************
   * Following handles the request for withdraw:
   * First we decrypt the User data using RSA PrivateKey
   * then response is send it to the ATM via trusted channel
   ************************************************************/

  // let encrypteddata = req.body.encrypteddata;
  // let decrypted_data = decryptStringWithRsaPrivateKey(encrypteddata);
  // decrypted_data = JSON.parse(decrypted_data);

  // if (decrypted_data.bank_authkey === authfilecontent) {
  // } else {
  //   console.log(255);
  //   resp.send({
  //     output: "account already exist"
  //   });

  // }
  let { account, withdraw_amount, cardfile } = req.body;
  let flag = true;

  /*****************************************************************
   * Following code checks for the account into customers array
   * if it founds this, then for that client total_balance is updated
   * and withdraw amount response sent to Atm
   *******************************************************************/

  for (let i = 0; i < customers.length; i++) {
    if (
      account === customers[i].account &&
      cardfile === customers[i].cardfile
    ) {
      if (
        parseFloat(withdraw_amount) < parseFloat(customers[i].total_balance)
      ) {
        customers[i].total_balance =
          parseFloat(customers[i].total_balance) - parseFloat(withdraw_amount);
        withdraw_amount = parseFloat(withdraw_amount);
        flag = !flag;
        resp.send({
          account: account,
          withdraw_amount: withdraw_amount,
          total_balance: customers[i].total_balance
        });
        console.log(
          `{"account":"${customers[i].account}","withdraw":${withdraw_amount}}`
        );
        // console.log(
        //   `{"withdraw":${withdraw_amount}, "account": "${customers[i].account}"}`
        // );
      } else {
        resp.send({
          output: "Insufficient Balance!!"
        });
        flag = !flag;
      }

      break;
    }
  }
  if (flag) {
    resp.send({
      output: "account does not match"
    });
  } else {
    flag = !flag;
  }
});

app.post("/checkbalance", function(req, resp) {
  /***************************************************
   * Following handles the request for checkbalance:
   * First we decrypt the User data using RSA PrivateKey
   * then response is send it the bank via trusted channel
   **************************************************/

  // let encrypteddata = req.body.encrypteddata;
  // let passphrase = "Aamir12345";
  // let decrypted_data = decryptStringWithRsaPrivateKey(encrypteddata);
  // decrypted_data = JSON.parse(decrypted_data);

  // if (decrypted_data.bank_authkey === authfilecontent) {
  //   //console.log("successfully authenticated");
  // } else {
  //   console.log(255);
  //   resp.send({
  //     output: "account already exist"
  //   });
  // }
  let { account, cardfile } = req.body;

  let flag = true;

  for (let i = 0; i < customers.length; i++) {
    if (account == customers[i].account && cardfile === customers[i].cardfile) {
      flag = !flag;
      resp.send({
        account: account,
        total_balance: customers[i].total_balance
      });
      console.log(
        `{"account":"${customers[i].account}","balance":${customers[i].total_balance}}`
      );
      // console.log(
      //   `{"balance":${customers[i].total_balance}, "account": "${customers[i].account}"}`
      // );
      break;
    }
  }
  if (flag) {
    resp.send({
      output: "account does not match"
    });
  }
});

/*
 * As soon the bank server is started: bank auth file, Public key and private key file
 * is generated.
 */

function bank_start(fileName) {
  /* First randomly keystring is generated for every unique customer
  and that data is stored to *.auth file. This keystring data act as secret key
  which we are using here to check the authenticity of request which is sent from 
  ATM client */
  if (argument.parent === undefined) {
    let keystring = uuid.v4();
    authfilecontent = keystring;
    if (fileName) {
      fs.writeFile(fileName, keystring, error => {
        if (error) {
          throw error;
        }
      });
      console.log("created");
    }
  } else {
    let keystring = uuid.v4();
    authfilecontent = keystring;
    if (fileName) {
      fs.writeFile(argument.parent + "/" + fileName, keystring, error => {
        if (error) {
          //throw error;
          systemError(255);
        }
      });
      console.log("created");
    }
  }
}

// function generatePrivatePublicKeyPair() {

//   //this passphrase is the password for the privatekey
//   let passphrase = "Aamir12345";

//   /*
//     Generate private and public key pair
//     public key is used to encrypt the ATM request to server
//     ATM request contains the *.auth key, and card file
//     Private key first decrypt the ATM request
//     Then first secret key is checked, and also the card file
//   */

//   generateKeyPair(
//     "rsa",
//     {
//       modulusLength: 4096,
//       publicKeyEncoding: {
//         type: "spki",
//         format: "pem"
//       },
//       privateKeyEncoding: {
//         type: "pkcs8",
//         format: "pem",
//         cipher: "aes-256-cbc",
//         passphrase: passphrase
//       }
//     },
//     (err, publicKey, privateKey) => {
//       fs.writeFileSync("privateKey.txt", privateKey);
//       fs.writeFileSync("publicKey.txt", publicKey);

//       if (err) console.log("err", err);
//     }
//   );

//   //using only one private and public key to encrypt and decrypt multiple atm user
//   //as this key is used internally, it won't implact any security

//   checker++;
// }

// let passphrase = "Aamir12345";

// function decryptStringWithRsaPrivateKey(toDecrypt) {
//   var privateKey = fs.readFileSync("privateKey.txt", "utf8");
//   let buffer = Buffer.from(toDecrypt, "base64");
//   var decrypted = crypto.privateDecrypt(
//     { key: privateKey, passphrase: passphrase },
//     buffer
//   );
//   return decrypted.toString("utf8");
// }

const del = require("del");
process.on("SIGTERM", async () => {
  // console.info("SIGTERM signal received, server stopped");
  await del(["*.auth", "*.txt", "*.card"]);
  process.exit(0);
});

function systemError(msg) {
  //console.log(msg);
  process.exit(msg);
}
