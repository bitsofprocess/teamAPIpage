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

const CURRENTSTAGE = 'apptest';
const ENVTABLENAME = 'env';

let BASE_URL = "https://dmp3yci3ik.execute-api.us-east-1.amazonaws.com/apptest"
    let request_log
    let response_log
    let team_response_log

let attributeName;
let attributeValue;
let userEmail;
let userName;
let userId;
let userDetails;

    const set_search_attribute = () => {
      attributeName = document.getElementById("attributeName").value;
      // console.log(attributeName);
    }

    set_attribute_value = () => {
      attributeValue = document.getElementById("attributeValue").value;
      console.log('attributeValue: ', attributeValue);
    }

    set_user_email = () => {
      userEmail = document.getElementById("userEmail").value;
    }

    const set_stage = async () => {
      BASE_URL = document.getElementById("stage-select").value;
      // console.log('BASE_URL: ', BASE_URL);
    }

    const on_load = () => {
      terminal = document.getElementById("terminal")
      // response_log = document.getElementById("response-log")
      team_response_log = document.getElementById("team-response-log")
    }

    // const toggle_loader = (flag) => {
    //   if (flag) {
    //     document.getElementById("loader").style.display = "block"
    //   } else {
    //     document.getElementById("loader").style.display = "none"
    //   }
    // }

    function write_request({ url, method, body }) {
      var pre = document.createElement("p")
      pre.style.wordWrap = "break-word"
      pre.innerHTML = `${Date().toString()}
URL: ${url}
Method: ${method}
Body: ${JSON.stringify(body)}
      `
      if (terminal.hasChildNodes()) {
        terminal.insertBefore(pre, terminal.childNodes[0])
      } else {
        terminal.appendChild(pre)
      }
    }

    function write_response(message) {
      var pre = document.createElement("p")
      pre.style.wordWrap = "break-word"
      pre.innerHTML = Date().toString() + "\n" + message
      if (terminal.hasChildNodes()) {
        terminal.insertBefore(pre, terminal.childNodes[0])
      } else {
        terminal.appendChild(pre)
      }
    }

    function write_team(message) {
      var pre = document.createElement("p")
      pre.style.wordWrap = "break-word"
      pre.innerHTML =
        Date().toString() + "\n" + JSON.stringify(message, null, 4)
      if (terminal.hasChildNodes()) {
        terminal.removeChild(terminal.childNodes[0])
      }
      terminal.appendChild(pre)
    }

    const call_api = async ({ url, method, body }) => {
      write_request({ url, method, body })
      // toggle_loader(true)
      try {
        const response = await fetch(url, {
          method,
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
        const data = await response.json();
        userDetails = data;
        write_response(JSON.stringify(data))
        // toggle_loader(false)
        return data
      } catch (error) {
        write_response(JSON.stringify(error))
        // toggle_loader(false)
      }
    }

    const displayUserDetails = (userDetails) => {
      console.log('displayUserDetails: ', userDetails);
      console.log('username: ', userDetails.Username);
      console.log('email: ', userDetails.email);
      console.log('team code: ', userDetails["custom:promocode"]);
      const userDetailsWindow = document.getElementById("user-details");
      // let userIdDetails = userDetails.Username;
      // let userEmailDetails = userDetails.email;

      let pre = document.createElement("p")
      pre.style.wordWrap = "break-word"
      pre.innerHTML +=  `
        <tr>
          <td>User Id: ${userDetails.Username}</td>
          <td>Email: ${userDetails.email}</td>   
        </tr>
      `
      if (userDetailsWindow.hasChildNodes()) {
        userDetailsWindow.insertBefore(pre, userDetailsWindow.childNodes[0])
      } else {
        userDetailsWindow.appendChild(pre)
      }
      
      // .then(response => response.json())
      //           .then(data => {
      //               for (var i = 0; i<data.items.length; i++){
      //                   let vmovieID = data.items[i].movieID;
      //                   let vtitle = data.items[i].title;
      //                   let vposter = data.items[i].poster;
      //                       document.querySelector("#tb1").innerHTML += `
      //                           <tr>
      //                               <td>${vmovieID}</td>
      //                               <td>${vtitle}</td>
      //                               <td>${vposter}</td>
      //                           </tr>`;
      //               }
      //           })
    }

    const genereate_new_promocode = async () => {
      await call_api({
        url: `${BASE_URL}/generateNewPromoCode`,
        method: "POST",
        body: {
          firstName: document.getElementById("firstName").value,
          lastName: document.getElementById("lastName").value,
          email: document.getElementById("email").value,
          businessName: document.getElementById("businessName").value,
          userId: document.getElementById("userId").value,
        },
      })
    }

    const get_user_attributes = async () => {
      const id = document.getElementById("userIdValue").value
      await call_api({
        url: `${BASE_URL}/getCognitoUserAttributes/${id}`,
        method: "GET"
      })
      displayUserDetails(userDetails);
    }
    
    const add_user_to_team = async () => {
      const user_id = document.getElementById("add-to-team-user-id").value
      const promocode = document.getElementById("add-to-team-promocode").value
      await call_api({
        url: `${BASE_URL}/checkPromoCode/?userId=${user_id}&promocode=${promocode}`,
        method: "GET",
      })
    }

    const remove_from_team = async () => {
      const userId = document.getElementById("remove-from-team-user-id").value
      const promoCode = document.getElementById(
        "remove-from-team-promocode"
      ).value
      await call_api({
        url: `${BASE_URL}/removePlayerFromPromoCode`,
        method: "POST",
        body: { promoCode, userId },
      })
    }

    const change_team = async () => {
      await call_api({
        url: `${BASE_URL}/changeTeam`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { from, to, userId },
      })
    }

    const get_team_link = async () => {
      const teamCode = document.getElementById("get-team-link-teamCode").value
      const userName = document.getElementById("get-team-link-userName").value
      await call_api({
        url: `${BASE_URL}/getTeamLink/?team_code=${teamCode}&user_name=${userName}`,
        method: "GET",
      })
    }

    const get_team = async () => {
      // toggle_loader(true)
      const teamCode = document.getElementById("get-team-teamCode").value
      const team = await call_api({
        url: `${BASE_URL}/getTeam/${teamCode}`,
        method: "GET",
      })
      write_team(team)
    }

    window.addEventListener("load", on_load, false)

    /* TO BE ADDED AS LAMBDA */

    const getUserByEmail = async () => {
      userEmail = document.getElementById("emailValue").value
  
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
    
                  data.Users.forEach((element,index) => {
                    element.Attributes.forEach((attribute) => {
                      data.Users[index][attribute.Name] = attribute.Value;
                    });
                    delete data.Users[index].Attributes;
                    if (element.identities) {
                      data.Users[index]["providerName"] = JSON.parse(data.Users[index].identities)[0].providerName;
                    } else if (element["custom:microsoftToken"]) {
                      data.Users[index]["providerName"] = "Microsoft"
                    } else {
                      data.Users[index]["providerName"] = "Email/Password"
                    }
                    delete data.Users[index].identities
                  
                  })
                  
                  data.Users.forEach((element,index) => {
                    console.log(data.Users[index]);
                    // write_response(JSON.stringify(data.Users[index]))
                  })
    
          
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
    }

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
          Limit: "1",
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
                } else if (attributesToGet.length == 0) {
                  user["Username"] = data.Users[0].Username;
                  data.Users[0].Attributes.forEach((attribute) => {
                    user[attribute.Name] = attribute.Value;
                  });
                } else if (data && data.Users && data.Users.length > 0) {
                  for (let key in data.Users[0]) {
                    if (attributesToGet.includes(key)) {
                      user[key] = data.Users[0][key];
                    }
                  }
                  data.Users[0].Attributes.forEach((attribute) => {
                    if (attributesToGet.includes(attribute.Name)) {
                      user[attribute.Name] = attribute.Value;
                    }
                  });
                }
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

    function listUserByName() {
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
    
                console.log(`data: ${JSON.stringify(data, null, 2)}`);
                console.log(`data.Users: ${JSON.stringify(data.Users, null, 2)}`);
    
    
                if (data && data.Users && data.Users.length == 0) {
                  reject("failed");
                } else if (attributesToGet.length == 0) {
                  user["Username"] = data.Users[0].Username;
                  data.Users[0].Attributes.forEach((attribute) => {
                    user[attribute.Name] = attribute.Value;
                  });
                } else if (data && data.Users && data.Users.length > 0) {
                  for (let key in data.Users[0]) {
                    if (attributesToGet.includes(key)) {
                      user[key] = data.Users[0][key];
                    }
                  }
                  data.Users[0].Attributes.forEach((attribute) => {
                    if (attributesToGet.includes(attribute.Name)) {
                      user[attribute.Name] = attribute.Value;
                    }
                  });
                }
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