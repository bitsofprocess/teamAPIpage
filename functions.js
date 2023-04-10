// const AWS = require("aws-sdk");
// require('dotenv').config();
// import {AWS} from 'aws-sdk';

// const myCredentials = {
//   accessKeyId: process.env.ACCESS_KEY,
//   secretAccessKey: process.env.SECRET_KEY,
// };

AWS.config = new AWS.Config({
  credentials: myCredentials,
  region: "us-east-1",
});

const documentClient = new AWS.DynamoDB.DocumentClient();
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const CURRENTSTAGE = "apptest";
const ENVTABLENAME = "env";

let BASE_URL = "https://dmp3yci3ik.execute-api.us-east-1.amazonaws.com/apptest";
let request_log;
let response_log;
let team_response_log;

let attributeName;
let attributeValue;
let userEmail;
let userName;
let userId;
// let userDetails;

const set_search_attribute = () => {
  attributeName = document.getElementById("attributeName").value;
  // console.log(attributeName);
};

set_attribute_value = () => {
  attributeValue = document.getElementById("attributeValue").value;
  console.log("attributeValue: ", attributeValue);
};

set_user_email = () => {
  userEmail = document.getElementById("userEmail").value;
};

const set_stage = async () => {
  BASE_URL = document.getElementById("stage-select").value;
  // console.log('BASE_URL: ', BASE_URL);
};

const on_load = () => {
  terminal = document.getElementById("terminal");
  // response_log = document.getElementById("response-log")
  team_response_log = document.getElementById("team-response-log");
};

function write_request({ url, method, body }) {
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = `${Date().toString()}
URL: ${url}
Method: ${method}
Body: ${JSON.stringify(body)}
  `;
  if (terminal.hasChildNodes()) {
    terminal.insertBefore(pre, terminal.childNodes[0]);
  } else {
    terminal.appendChild(pre);
  }
}

function write_response(message) {
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = Date().toString() + "\n" + message;
  if (terminal.hasChildNodes()) {
    terminal.insertBefore(pre, terminal.childNodes[0]);
  } else {
    terminal.appendChild(pre);
  }
}

function write_team(message) {
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = Date().toString() + "\n" + JSON.stringify(message, null, 4);
  if (terminal.hasChildNodes()) {
    terminal.removeChild(terminal.childNodes[0]);
  }
  terminal.appendChild(pre);
}

const call_api = async ({ url, method, body }) => {
  write_request({ url, method, body });
  // toggle_loader(true)
  try {
    const response = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    userDetails = data;
    write_response(JSON.stringify(data));
    // toggle_loader(false)
    return data;
  } catch (error) {
    write_response(JSON.stringify(error));
    // toggle_loader(false)
  }
};

// Reference: https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_onchange

// create button: https://stackoverflow.com/questions/7066191/javascript-onclick-onsubmit-for-dynamically-created-button
const displayUserDetails = async (userDetails) => {
  // const userDetails = JSON.parse(document.getElementById("emailDropdown").value);

  write_response(JSON.stringify(userDetails, null, 2));
  const userDetailsWindow = document.getElementById("user-details");
  // document.getElementById("user-details")
  userDetailsWindow.innerHTML =
    "<h4>Full Name:</h4> " +
    '<span id="username">' +
    userDetails.name +
    "</span>" +
    "<h4>User Id:</h4> " +
    '<span id="username">' +
    userDetails.Username +
    "</span>" +
    "<h4>Email:</h4> " +
    userDetails.email +
    "<h4>Team Code:</h4> " +
    userDetails["custom:promocode"] +
    "<h4>Business/Team Name:</h4> " +
    userDetails["custom:promodescription"] +
    "<h4>Provider Name:</h4> " +
    userDetails["providerName"];

  const button = document.createElement("button");
  button.type = "submit";
  button.innerHTML = "Populate";
  button.onclick = function () {
    populateActionInputs(userDetails);
  };
  // button.addEventListener("click", populateInputs(userDetails));
  // button.onclick = populateInputs();
  userDetailsWindow.appendChild(button);
};

const displayActionDetails = async (actionType, response) => {
  const actionDetailsWindow = document.getElementById("action-details");

  // create team values
  const create_teamCode = response.code;
  const create_teamName = document.getElementById("businessName").value;

  //add user values
  const add_userID = document.getElementById("add-to-team-user-id").value;
  const add_teamCode = document.getElementById("add-to-team-promocode").value;

  //remove user values
  remove_userID = document.getElementById("remove-from-team-user-id").value;
  remove_teamCode = document.getElementById("remove-from-team-promocode").value;
  remove_teamName = response["custom:promodescription"];

  //change values
  change_userID = document.getElementById("change-team-user-id").value;
  change_fromTeamCode = document.getElementById("change-team-from").value;
  change_toTeamCode = document.getElementById("change-team-to").value;

  //magic link values
  magic_teamCode = document.getElementById("get-team-link-teamCode").value;

  // let pre = document.createElement("p");
  // pre.style.wordWrap = "break-word";

  // if (actionDetailsWindow.hasChildNodes()) {
  //   actionDetailsWindow.insertBefore(pre, actionDetailsWindow.childNodes[0])
  // } else {
  //   actionDetailsWindow.appendChild(pre)
  // }

  switch(actionType) {
    case 'createTeam':
      // pre.style.wordWrap = "break-word"
      actionDetailsWindow.innerHTML +=  
        '<h4>The team code for </h4> ' + create_teamName + '<h4> is </h4>' + create_teamCode;
      break;
    case 'addUser':
      // pre.style.wordWrap = "break-word"
      actionDetailsWindow.innerHTML +=  
        '<h4>User: </h4> ' + add_userID + 
        '<h4> ADDED to Team Code: </h4>' + add_teamCode + 
        '<h4>for Team: </h4> ' + response.description + 
        '<h4>Additional Notes: </h4> ' + response.message;
      break;
    case 'removeUser':
      // console.log(response);
      // pre.style.wordWrap = "break-word"
      actionDetailsWindow.innerHTML +=  
      '<h4>User: </h4> ' + remove_userID + 
      '<h4> REMOVED from Team Code: </h4>' + remove_teamCode + 
      '<h4>for Team: </h4> ' + remove_teamName + 
      '<h4>Additional Notes: </h4> ' + response.message;
      break;
    case 'changeTeams':
      console.log('change response: ', response);
      actionDetailsWindow.innerHTML +=  
      '<h4>User: </h4> ' + change_userID + 
      '<h4> CHANGED FROM Team Code: </h4>' + change_fromTeamCode + 
      '<h4>TO Team: </h4> ' + change_toTeamCode + 
      '<h4>Additional Notes: </h4> ' + response.message;
      break;
    case 'MagicLink':
      // pre.style.wordWrap = "break-word"
      actionDetailsWindow.innerHTML +=  
      '<h4>Magic Link: </h4> ' + response.url + 
      '<h4> for Team Code: </h4>' + magic_teamCode;
      break;
    default:
      // code block
  }
}

const displayFromEmailValue = async () => {
  const userDetails = JSON.parse(
    document.getElementById("emailDropdown").value
  );

  displayUserDetails(userDetails);
};

const generate_new_promocode = async () => {
  const response = await call_api({
    url: `${BASE_URL}/generateNewPromoCode`,
    method: "POST",
    body: {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      businessName: document.getElementById("businessName").value,
      userId: document.getElementById("userId").value,
    },
  });
  // console.log(response);
  displayActionDetails('createTeam', response);
};

const get_user_attributes = async () => {
  const id = document.getElementById("userIdValue").value;
  const userDetails = await call_api({
    url: `${BASE_URL}/getCognitoUserAttributes/${id}`,
    method: "GET",
  });
  displayUserDetails(userDetails);
};

const add_user_to_team = async () => {
  const user_id = document.getElementById("add-to-team-user-id").value;
  const promocode = document.getElementById("add-to-team-promocode").value;
  const response = await call_api({
    url: `${BASE_URL}/checkPromoCode/?userId=${user_id}&promocode=${promocode}`,
    method: "GET",
  });
  console.log('addUser response: ', response);

  displayActionDetails('addUser', response);
};

const remove_from_team = async () => {
  const userId = document.getElementById("remove-from-team-user-id").value;
  const promoCode = document.getElementById("remove-from-team-promocode").value;
 
  const response = await call_api({
    url: `${BASE_URL}/removePlayerFromPromoCode`,
    method: "POST",
    body: { promoCode, userId },
  });

  console.log('remove response: ', response)
  displayActionDetails('removeUser', response);
};

const change_team = async () => {

  const userId = document.getElementById(
    "change-team-user-id"
  ).value
  const from = document.getElementById("change-team-from").value
  const to = document.getElementById(
    "change-team-to"
  ).value

  const response = await call_api({
    url: `${BASE_URL}/changeTeam`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: { from, to, userId },
  });

  displayActionDetails('changeTeams', response);
};

const get_team_link = async () => {
  const teamCode = document.getElementById("get-team-link-teamCode").value;
  const userName = document.getElementById("get-team-link-userId").value;
  const response = await call_api({
    url: `${BASE_URL}/getTeamLink/?team_code=${teamCode}&user_name=${userName}`,
    method: "GET",
  });

  displayActionDetails('MagicLink', response);
};

const displayTeamDetails = async (response) => {
  const userDetailsWindow = document.getElementById("team-details");

  let pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML += "<h4>The team code for</h4> " + response.data["team_name"];

  if (userDetailsWindow.hasChildNodes()) {
    userDetailsWindow.insertBefore(pre, userDetailsWindow.childNodes[0]);
  } else {
    userDetailsWindow.appendChild(pre);
  }
};

const get_team = async () => {
  // toggle_loader(true)
  const teamCode = document.getElementById("get-team-teamCode").value;
  const team = await call_api({
    url: `${BASE_URL}/getTeam/${teamCode}`,
    method: "GET",
  });
  write_team(team);
  displayTeamDetails(team);
};

window.addEventListener("load", on_load, false);

/* TO BE ADDED AS LAMBDA */

const getUserByEmail = async () => {
  userEmail = document.getElementById("emailValue").value;

  return new Promise(async (resolve, reject) => {
    const user = {};

    const envParams = {
      TableName: ENVTABLENAME,
      Key: {
        environment: CURRENTSTAGE,
      },
    };
    // Get env table from dynamo
    const envTable = (await documentClient.get(envParams).promise()).Item;
    // Get user pool value from the env table
    const USERPOOLID = envTable["user pool"];

    // -- Get user from cognito
    // -- get refresh token from user data
    const params = {
      UserPoolId: USERPOOLID,
      // AttributesToGet: attributesToGet,
      Filter: `email = '${userEmail}'`,
      Limit: "60",
    };

    try {
      await new Promise((resolve, reject) => {
        cognitoidentityserviceprovider.listUsers(params, function (err, data) {
          if (err) {
            console.log(err, err.stack, "listUsers-error");
            user.user_id = userId;
            reject("failed");
          } // an error occurred
          else {
            data.Users.forEach((element, index) => {
              element.Attributes.forEach((attribute) => {
                data.Users[index][attribute.Name] = attribute.Value;
              });
              delete data.Users[index].Attributes;
              if (element.identities) {
                data.Users[index]["providerName"] = JSON.parse(
                  data.Users[index].identities
                )[0].providerName;
              } else if (element["custom:microsoftToken"]) {
                data.Users[index]["providerName"] = "Microsoft";
              } else {
                data.Users[index]["providerName"] = "Email/Password";
              }
              delete data.Users[index].identities;
            });

            // Reference: https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript

            data.Users.forEach((element, index) => {
              // console.log(data.Users[index].providerName);

              const emailDropdown = document.getElementById("emailDropdown");

              var option = document.createElement("option");
              option.text = element.providerName;
              option.value = JSON.stringify(element, null, 2);
              emailDropdown.add(option);
            });

            const userDetails = data.Users;
            write_response(JSON.stringify(userDetails, null, 2));

            // EmailDropdown(userDetails);
            // userDetails.forEach(displayUserDetails);
            // userDetails.forEach(userDetail => displayUserDetails(userDetail))

            resolve("success");
          } // successful response
        });
      });
      if (attributesToGet.includes("UserPoolId")) {
        user["UserPoolId"] = USERPOOLID;
      }
      resolve(user);

      // write_response(JSON.stringify(user));
    } catch (error) {
      resolve({ error: "failed" });
    }
  });
};

const getUserByName = async () => {
  userName = document.getElementById("nameValue").value;

  return new Promise(async (resolve, reject) => {
    const user = {};

    const envParams = {
      TableName: ENVTABLENAME,
      Key: {
        environment: CURRENTSTAGE,
      },
    };
    // Get env table from dynamo
    const envTable = (await documentClient.get(envParams).promise()).Item;
    // Get user pool value from the env table
    const USERPOOLID = envTable["user pool"];

    // -- Get user from cognito
    // -- get refresh token from user data
    const params = {
      UserPoolId: USERPOOLID,
      // AttributesToGet: attributesToGet,
      Filter: `name = '${userName}'`,
      Limit: "60",
    };

    try {
      await new Promise((resolve, reject) => {
        cognitoidentityserviceprovider.listUsers(params, function (err, data) {
          if (err) {
            console.log(err, err.stack, "listUsers-error");
            user.user_id = userId;
            reject("failed");
          } // an error occurred
          else {
            console.log(`data: ${JSON.stringify(data, null, 2)}`);
            console.log(`data.Users: ${JSON.stringify(data.Users, null, 2)}`);

            if (data && data.Users && data.Users.length == 0) {
              reject("failed");
            } 
            // else if (attributesToGet.length == 0) {
            //   user["Username"] = data.Users[0].Username;
            //   data.Users[0].Attributes.forEach((attribute) => {
            //     user[attribute.Name] = attribute.Value;
            //   });
            // } else if (data && data.Users && data.Users.length > 0) {
            //   for (let key in data.Users[0]) {
            //     if (attributesToGet.includes(key)) {
            //       user[key] = data.Users[0][key];
            //     }
            //   }
            //   data.Users[0].Attributes.forEach((attribute) => {
            //     if (attributesToGet.includes(attribute.Name)) {
            //       user[attribute.Name] = attribute.Value;
            //     }
            //   });
            // }
            resolve("success");
          } // successful response
        });
      });
      if (attributesToGet.includes("UserPoolId")) {
        user["UserPoolId"] = USERPOOLID;
      }
      // console.log(user);
      resolve(user);
    } catch (error) {
      resolve({ error: "failed" });
    }
  });
};

function listUserByName() {
  const name = document.getElementById("nameValue").value;
  return new Promise(async (resolve, reject) => {
    const user = {};

    const envParams = {
      TableName: ENVTABLENAME,
      Key: {
        environment: CURRENTSTAGE,
      },
    };
    // Get env table from dynamo
    const envTable = (await documentClient.get(envParams).promise()).Item;
    // Get user pool value from the env table
    const USERPOOLID = envTable["user pool"];

    // -- Get user from cognito
    // -- get refresh token from user data
    const params = {
      UserPoolId: USERPOOLID,
      AttributesToGet: ["email"],
      Filter: `name ^= '${name}'`,
      Limit: "60",
    };

    try {
      await new Promise((resolve, reject) => {
        cognitoidentityserviceprovider.listUsers(params, function (err, data) {
          if (err) {
            console.log(err, err.stack, "listUsers-error");
            user.name = name;
            reject("failed");
          } // an error occurred
          else {
            // console.log(`data: ${JSON.stringify(data, null, 2)}`);
            console.log(
              `data.Users: ${JSON.stringify(data.Users[0].Attributes, null, 2)}`
            );

            if (data && data.Users && data.Users.length == 0) {
              reject("failed");
            } 
            // else if (attributesToGet.length == 0) {
            //   user["Username"] = data.Users[0].Username;
            //   data.Users[0].Attributes.forEach((attribute) => {
            //     user[attribute.Name] = attribute.Value;
            //   });
            // } else if (data && data.Users && data.Users.length > 0) {
            //   for (let key in data.Users[0]) {
            //     if (attributesToGet.includes(key)) {
            //       user[key] = data.Users[0][key];
            //     }
            //   }
            //   data.Users[0].Attributes.forEach((attribute) => {
            //     if (attributesToGet.includes(attribute.Name)) {
            //       user[attribute.Name] = attribute.Value;
            //     }
            //   });
            // }
            resolve("success");
          } // successful response
        });
      });
      if (attributesToGet.includes("UserPoolId")) {
        user["UserPoolId"] = USERPOOLID;
      }
      // console.log(user);
      resolve(user);
    } catch (error) {
      resolve({ error: "failed" });
    }
  });
}

const openAction = (evt, action) => {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(action).style.display = "block";
  evt.currentTarget.className += " active";
};

function populateActionInputs(userDetails) {
  console.log(userDetails);
  console.log('businessName:', userDetails["custom:promodescription"])

  const fullName = userDetails.name;
  const splitName = fullName.split(" ");
  const firstName = splitName[0];
  const lastName = splitName[1];
  const email = userDetails.email;
  const businessName = userDetails["custom:promodescription"];
  const userId = userDetails.Username;
  const currentTeamCode = userDetails["custom:promocode"];

  //create-team inputs
  document.querySelector("#firstName").value = firstName;
  document.querySelector("#lastName").value = lastName;
  document.querySelector("#email").value = email;
  document.querySelector("#businessName").value = businessName;
  document.querySelector("#userId").value = userId;

  // add-to-team-inputs
  document.querySelector("#add-to-team-user-id").value = userId;
  document.querySelector("#add-to-team-promocode").value = currentTeamCode;

  // remove-from-team inputs
  document.querySelector("#remove-from-team-user-id").value = userId;
  document.querySelector("#remove-from-team-promocode").value = currentTeamCode;

  // change-team inputs
  document.querySelector("#change-team-user-id").value = userId;
  document.querySelector("#change-team-from").value = currentTeamCode;
  // document.querySelector("#change-team-to").value;

  // get-team-link inputs
  document.querySelector("#get-team-link-teamCode").value = currentTeamCode;
  document.querySelector("#get-team-link-userId").value = userId;
}

const populateEmailDropdown = async (userDetails) => {
  userDetails.forEach((element, index) => {
    console.log(data.Users[index].providerName);

    // var json = { "data": ["orange", "banana", "apple", "pear"] };

    const emailDropdown = document.getElementById("emailDropdown");

    // for (var i = 0; i < json.data.length; i++) {
    var option = document.createElement("option");
    option.text = data.Users[index].providerName;
    option.value = data.Users[index].providerName;
    emailDropdown.add(option);
  });
  // console.log(object);
  // var json = { "data": ["orange", "banana", "apple", "pear"] };

  // const emailDropdown = document.getElementById("emailDropdown");

  // for (var i = 0; i < json.data.length; i++) {
  //   var option = document.createElement("option");
  //   option.text = json.data[i];
  //   option.value = json.data[i];
  //   dropdown.add(option);
  // }
};

const clearEmailDropdown = async () => {
  const dropDown = document.getElementById("emailDropdown");

  dropDown.options.length = 0;
};
