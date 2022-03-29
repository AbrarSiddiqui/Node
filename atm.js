const yargs = require("yargs");
const axios = require("axios");
var fs = require("fs");
var authfilecontent;
let crypto = require("crypto");
const { generateKeyPair } = require("crypto");
let encrypteddata;
axios.defaults.timeout = 10000;
//var io = require("socket.io-client");
const err = 255;
//var dir = "./authfile";
// if (!fs.existsSync(dir)) {
//   fs.mkdirSync(dir);
// }
let new_Given;
let deposit_Given;
let withdraw_Given;

const argument = yargs
  .option("account", {
    alias: "a",
    description: "account",
    type: "array",
    default: [""]
  })
  .option("new", {
    alias: "n",
    description: "new account",
    type: "string"
  })
  .option("deposit", {
    alias: "d",
    description: "deposit amount",
    type: "string"
  })
  .option("withdraw", {
    alias: "w",
    description: "withdraw amount",
    type: "string"
  })
  .option("getBalance", {
    alias: "g",
    description: "getBalance",
    type: "boolean",
    default: "false"
  })
  .option("port", {
    alias: "p",
    description: "port number",
    type: "array",
    default: ["3000"]
  })
  .option("ip_address", {
    alias: "i",
    description: "ip address",
    type: "array",
    default: ["127.0.0.1"]
  })
  .option("auth", {
    alias: "s",
    description: "auth file",
    type: "array",
    default: ["bank.auth"]
  })
  .option("card", {
    alias: "c",
    description: "card file",
    type: "array",
    default: [""]
  })
  .option("parent", {
    alias: "x",
    description: "parent path",
    type: "string"
  }).argv;
// if (!argument.options.toString() == "") {
//   console.log("Wrong Arguments");
//   systemError(255);
// }

if (parseFloat(argument.new) > 9.99 || argument.new == undefined) {
  //console.log("New is valid");
  if (!(argument.new == undefined)) {
    new_Given = true;
    // if (argument.new.length > 1) {
    //   console.log("new is repeated");
    //   systemError(255);
    // }
  } else {
    //console.log("new is not given");
    new_Given = false;
  }
} else {
  //console.log("New is invalid");
  systemError(255);
}

////////////////////////////////////
if (parseFloat(argument.withdraw) >= 0.0 || argument.withdraw == undefined) {
  if (!(argument.withdraw == undefined)) {
    withdraw_Given = true;
    // if (argument.withdraw.length > 1) {
    //   //console.log("withdraw is repeated");
    //   systemError(255);
    // }
  } else {
    //console.log("withdraw is not given");
    withdraw_Given = false;
  }
} else {
  //console.log("Withdraw is invalid");
  systemError(255);
}
////////////////////////////////////////////
if (parseFloat(argument.deposit) >= 0.0 || argument.deposit == undefined) {
  if (!(argument.deposit == undefined)) {
    deposit_Given = true;
    // if (argument.deposit.length > 1) {
    //   console.log("deposit is repeated");
    //   systemError(255);
    // }
  } else {
    // console.log("deposit is not given");
    deposit_Given = false;
  }
} else {
  //console.log("Deposit is invalid");
  systemError(255);
}
//////////Here we check for the duplicate options and arguments/////////////
if (argument._.length != "") {
  //console.log("Redundent Arguments");
  systemError(255);
}
////////////existence handled/////
if (
  (argument.getBalance == true && new_Given) ||
  (argument.getBalance == true && withdraw_Given) ||
  (argument.getBalance == true && deposit_Given) ||
  (deposit_Given && withdraw_Given) ||
  (new_Given && withdraw_Given) ||
  (withdraw_Given && deposit_Given)
) {
  systemError(255);
}

//   (argument.getBalance[0] == true && argument.withdraw != "") ||
//   (argument.getBalance[0] == true && new_notGiven) ||
//   (!deposit_notGiven && argument.deposit != "") ||
//   (argument.getBalance[0] == true && argument.withdraw != "") ||
//   (argument.getBalance[0] == true && new_notGiven)
// )
if (argument.ip_address[0] != "127.0.0.1") {
  systemError(255);
}
///////Here we check for valid numeric inputs for new deposit and withdraw/////////////
if (argument.new != undefined) {
  if (
    argument.new != "" &&
    (parseFloat(argument.new) < 0.0 || parseFloat(argument.new) > 4294967295.99)
  ) {
    //console.log("Entered amount is not within limits");
    systemError(255);
  } else if (argument.new.length > 4096) {
    systemError(255);
  }
}
if (argument.deposit != undefined) {
  if (
    argument.deposit != "" &&
    (parseFloat(argument.deposit) < 0.0 ||
      parseFloat(argument.deposit) > 4294967295.99)
  ) {
    //console.log("Entered amount is not within limits");
    systemError(255);
  } else if (argument.deposit.length > 4096) {
    systemError(255);
  }
}
if (argument.withdraw != undefined) {
  if (
    argument.withdraw != "" &&
    (parseFloat(argument.withdraw) < 0.1 ||
      parseFloat(argument.withdraw) > 4294967295.99)
  ) {
    //console.log("Entered amount is not within limits");
    systemError(255);
  } else if (argument.withdraw.length > 4096) {
    systemError(255);
  }
}

//////////Here we check for valid account port auth ip-address/////////////
if (argument.account) {
  if (argument.account.length > 1) {
    //console.log("Account name is repeated...");
    systemError(255);
  } else if (argument.account[0].toString().length > 122) systemError(255);
}

if (argument.port) {
  if (argument.port.length > 1) {
    //console.log("Port is repeated...");
    systemError(255);
  } else if (argument.port[0].toString().length > 4096) systemError(255);
}
if (argument.auth) {
  if (argument.auth.length > 1) {
    //console.log("Auth file is repeated...");
    systemError(255);
  } else if (argument.auth[0].toString().length > 4096) systemError(255);
}
if (argument.ip_address) {
  if (argument.ip_address.length > 1) {
    //console.log("Ip address is repeated...");
    systemError(255);
  } else if (argument.ip_address[0].toString().length > 4096) systemError(255);
}
//////////Here we check for valid card names/////////////
if (argument.card) {
  if (argument.card.length > 1) {
    //console.log("Card file is repeated...");
    systemError(255);
  } else if (
    ////Card names are to be between 1 and 127 characters long////////////
    argument.card[0] != "" &&
    (argument.card[0].toString().length < 2 ||
      argument.card[0].toString().length > 126)
  ) {
    //console.log("single character for card not allowed");
    systemError(255);
  }
}
if (argument.getBalance[0] == true && argument.getBalance.length > 1) {
  //console.log("get-balance is repeated...");
  systemError(255);
}

//console.log("2");
////////////////Socket Attempt////////////////////////
// var io = require("socket.io-client");
// var socket = io.connect("http://localhost:3000");
// socket.on("news", function(data) {
//   console.log(data);
//   socket.emit("CLI arguments", argument);
// });
///////////////////////////////////////////////////////

////////////For creating the valid auth file name//////////
if (argument.auth[0] != "bank.auth") {
  if (argument.auth[0] == "." || argument.auth[0] == "..") {
    //console.log("FIle name with `.` and `..` are not valid");
    systemError(255);
  }
}
var bankAuth = argument.auth[0];
if (!argument.auth[0].toString().includes(".auth")) {
  //console.log("auth name dont have .auth prefix");
  bankAuth += ".auth";
  argument.auth[0] = bankAuth;
}
////////////For creating the valid card file name////////////
if (argument.card[0] == "." || argument.card[0] == "..") {
  //console.log("FIle name with `.` and `..` are not valid");
  systemError(255);
}
var card = argument.card[0];
if (card == "") {
  card = argument.account[0];
  card += ".card";
  argument.card[0] = card;
} else if (!argument.card[0].toString().includes(".card")) {
  //console.log("card name dont have .card prefix");
  card += ".card";
  argument.card[0] = card;
}

//////////Valid Input for Names/////////////////////
var reg = /^[_\-\.0-9a-z]{1,250}$/;
//var reg = /^([a-z0-9]{5,})$/;1
if (argument.account[0] == "") {
  /////in case if account name not given
  //console.log("Account name not given");
  systemError(255);
} else if (!reg.test(argument.account[0].toString())) {
  //console.log("Account name invalid");
  systemError(255);
}
reg = /^[_\-\.0-9a-z]{1,255}$/;
if (!reg.test(argument.card[0].toString())) {
  //console.log("Card name invalid");
  systemError(255);
}
if (!reg.test(argument.auth[0].toString())) {
  //console.log("Auth file name invalid");
  systemError(255);
}
//console.log(argument.card);
//console.log("argument.parent", argument.parent);
//console.log(argument.auth);
/////////////valid input amount for deposit and withdraw//////////
//reg = /^((0|[1-9][0-9]*)|(?:\d*\.\d{2}))$/;
reg = /^((0|[1-9][0-9]*)\.\d{2})$/;
//console.log(argument.withdraw[0]);
if (argument.withdraw != undefined) {
  if (!reg.test(argument.withdraw)) {
    //console.log("Withdraw amount entered is invalid");
    systemError(255);
  }
}
if (argument.deposit != undefined) {
  if (!reg.test(argument.deposit)) {
    //console.log("Deposit amount entered is invalid");
    systemError(255);
  }
}

/////////////valid input amount for first deposit//////////
//reg = /^((0|[1-9][0-9]*)|(?:\d*\.\d{2}))$/;
if (argument.new != undefined) {
  //console.log(argument.new);
  if (!reg.test(argument.new)) {
    //console.log("New amount entered is invalid");
    systemError(255);
  }
}
/////////////valid input for ip-address//////////
//reg = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
reg = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
//console.log(argument.ip_address[0]);
if (argument.ip_address[0] != "") {
  if (!reg.test(argument.ip_address[0].toString())) {
    //console.log("IP-address is invalid");
    systemError(255);
  }
}

/////////////valid input for port-number//////////
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
/////////////Reading Key from Bank Auth file////////////////////////
//console.log("3");
// if (argument.auth[0] != "") {
//   if (!fs.existsSync(argument.auth[0])) {
//     //console.log("Auth file not found");
//     systemError(255);
//   } else {
//     authfilecontent = fs.readFileSync(
//       argument.parent + "/" + argument.auth[0],
//       "utf8"
//     );
//   }
// }

// if (argument.auth[0] != "") {
//   if (!fs.existsSync(argument.auth[0])) {
//     console.log("Auth file not found");
//     systemError(255);
//   }
// }

if (argument.auth[0] != "") {
  if (!fs.existsSync(argument.auth[0])) {
    console.log("Auth file not found");
    systemError(255);
  } else {
    authfilecontent = fs.readFileSync(
      argument.parent + "/" + argument.auth[0],
      "utf8"
    );
  }
}

/***************************************************
 * Following implements the New Account creation:
 * First we encrypt the User data using RSA PublicKey
 * then send it the bank via trusted channel
 **************************************************/

if (argument.account[0] != "" && new_Given) {
  console.log("in new account");
  ////////\\\\\\\\\\\\\\//////////

  if (argument.parent === undefined) {
    fs.writeFile(argument.card[0], argument.account[0], function(err) {
      if (err) {
        //throw err;
        systemError(255);
      }
    });
  } else if (fs.existsSync(argument.card[0])) {
    systemError(255);
  } else {
    fs.writeFile(
      argument.parent + "/" + argument.card[0],
      argument.account[0],
      function(err) {
        if (err) {
          //throw err;
          systemError(255);
        }
      }
    );
  }

  // requestdata = JSON.stringify({
  //   name: "access_denied",
  //   account: argument.account[0],
  //   initial_balance: argument.new,
  //   bank_authkey: authfilecontent,
  //   cardfile: argument.card[0]
  // });
  // encrypteddata = encryptStringWithRsaPublicKey(requestdata);
  //console.log("requestdata", requestdata);

  axios
    .post(`http://localhost:${argument.port[0]}/new`, {
      //encrypteddata: encrypteddata
      name: "access_denied",
      account: argument.account[0],
      initial_balance: argument.new,
      bank_authkey: authfilecontent,
      cardfile: argument.card[0]
    })
    .then(function(response) {
      // `data` is the response that was provided by the server
      if (response.data.output === "account already exist") {
        //console.log("accout already existed");
        systemError(255);
      } else if (response.data.output === "security breached") {
        //console.log("security breached");
        systemError(255);
      } else {
        console.log(
          `{"account":"${response.data.output[0].account}","initial_balance":${response.data.output[0].initial_balance}}`
        );
        // console.log(
        //   `{"initial_balance":${response.data.output[0].initial_balance}, "account": "${response.data.output[0].initial_balance}"}`
        // );
        systemError(0);
      }
      if (
        argument.account[0] == response.data.output[0].account &&
        argument.new == response.data.output[0].initial_balance
      ) {
        fs.writeFile(
          argument.parent + "/" + argument.card[0],
          argument.account[0],
          function(err) {
            if (err) {
              //throw err;
              systemError(255);
            }
          }
        );
      }
    })
    .catch(function(error) {
      systemError(63);
    });
  ////////////////////////////////////////////////////
} else if (argument.account[0] != "" && withdraw_Given) {
  /***************************************************
   * Following implements the Amount Withdrawl Request:
   * First we encrypt the User data using RSA PublicKey
   * then send it the bank via trusted channel
   **************************************************/
  //console.log("in withdraw");

  // requestdata = {
  //   name: "access_denied",
  //   account: argument.account[0],
  //   withdraw_amount: argument.withdraw,
  //   bank_authkey: authfilecontent,
  //   cardfile: argument.card[0]
  // };
  // encrypteddata = requestdata;

  axios
    .post(`http://localhost:${argument.port[0]}/withdraw`, {
      name: "access_denied",
      account: argument.account[0],
      withdraw_amount: argument.withdraw,
      bank_authkey: authfilecontent,
      cardfile: argument.card[0]
    })
    .then(function(response) {
      if (response.data.output == "Insufficient Balance!!") {
        systemError(255);
      } else if (response.data.output == "account does not match") {
        systemError(255);
      } else if (response.data.output === "security breached") {
        systemError(255);
      } else {
        console.log(
          `{"account":"${response.data.account}","withdraw":${response.data.withdraw_amount}}`
        );
        // console.log(
        //   `{"withdraw":${response.data.withdraw_amount}, "account": "${response.data.account}"}`
        // );
        systemError(0);
      }
      //console.log(response.data);
    })
    .catch(function(error) {
      systemError(63);
    });
} else if (argument.account[0] != "" && deposit_Given) {
  /***************************************************
   * Following implements the Deposit Amount Request:
   * First we encrypt the User data using RSA PublicKey
   * then send it the bank via trusted channel
   **************************************************/
  //console.log("in deposit");

  // requestdata = {
  //   name: "access_denied",
  //   account: argument.account[0],
  //   cardfile: argument.card[0],
  //   deposit_amount: argument.deposit,
  //   bank_authkey: authfilecontent
  // };

  //encrypteddata = requestdata;

  axios
    .post(`http://localhost:${argument.port[0]}/deposit`, {
      //encrypteddata: encrypteddata
      name: "access_denied",
      account: argument.account[0],
      cardfile: argument.card[0],
      deposit_amount: argument.deposit,
      bank_authkey: authfilecontent
    })
    .then(function(response) {
      if (response.data.output == "account does not match") {
        systemError(255);
      } else if (response.data.output === "security breached") {
        systemError(255);
      } else {
        console.log(
          `{"account":"${response.data.account}","deposit":${response.data.deposit_amount}}`
        );
        // console.log(
        //   `{"deposit":${response.data.deposit_amount}, "account": "${response.data.account}"}`
        // );
        systemError(0);
      }
    })
    .catch(function(error) {
      systemError(63);
    });
  //////////////////////////////////////////////////////////
} else if (argument.account[0] != "" && argument.getBalance == true) {
  /***************************************************
   * Following implements the Check Balance Request:
   * First we encrypt the User data using RSA PublicKey
   * then send it the bank via trusted channel
   **************************************************/
  //console.log("in balance check");

  // let requestdata = {
  //   name: "access_denied",
  //   account: argument.account[0],
  //   cardfile: argument.card[0],
  //   bank_authkey: authfilecontent
  // };
  // encrypteddata = requestdata;

  axios
    .post(`http://localhost:${argument.port[0]}/checkbalance`, {
      name: "access_denied",
      account: argument.account[0],
      cardfile: argument.card[0],
      bank_authkey: authfilecontent
    })
    .then(function(response) {
      if (response.data.output == "account does not match") {
        systemError(255);
      } else if (response.data.output === "security breached") {
        systemError(255);
      } else {
        console.log(
          `{"account":"${response.data.account}","balance":${response.data.total_balance}}`
        );
        // console.log(
        //   `{"balance":${response.data.total_balance}, "account": "${response.data.account}"}`
        // );
        systemError(0);
      }
      //console.log(response.data);
    })
    .catch(function(error) {
      systemError(63);
    });
} else {
  systemError(255);
}

// function encryptStringWithRsaPublicKey(toEncrypt) {
//   var publicKey = fs.readFileSync(
//     argument.parent + "/" + "publicKey.txt",
//     "utf8"
//   );
//   var buffer = Buffer.from(toEncrypt);
//   var encrypted = crypto.publicEncrypt(publicKey, buffer);
//   return encrypted.toString("base64");
// }

function systemError(msg) {
  /////This message should not be displayed explicitly until "echo $?" is called///
  //console.log(msg);
  process.exit(msg);
}
