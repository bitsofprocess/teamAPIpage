const AWS = require("aws-sdk");
// require("dotenv").config;
// const documentClient = new AWS.DynamoDB.DocumentClient();
// const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();


AWS.config = new AWS.Config({
  credentials: myCredentials,
  region: "us-east-1",
});

const documentClient = new AWS.DynamoDB.DocumentClient();
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const CURRENTSTAGE = 'apptest';
const ENVTABLENAME = 'env';

function getUserAttributes({ attributesToGet = [], email = "" }) {
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
      Filter: `email = '${email}'`,
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
              })

            resolve("success");
          } // successful response
        });
      });
      if (attributesToGet.includes("UserPoolId")) {
        user["UserPoolId"] = USERPOOLID;
      }
      resolve(user);
    } catch (error) {
      resolve({ error: "failed" });
    }
  });
}

// module.exports = getUserAttributes;

// getUserAttributes({ attributesToGet: [], email: "jfsimmon@usc.edu" })



// FRONT END TEST

const attributeName = 'username';
const attributeValue='9a274c46-8979-4f80-ae17-124d15acb809'

function getUser(attributeName, attributeValue) {
  // attributeName = document.getElementById("attributeValue").value
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
      Filter: `${attributeName} = '${attributeValue}'`,
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
              })

      
            resolve("success");
          } // successful response
        });
      });
      if (attributesToGet.includes("UserPoolId")) {
        user["UserPoolId"] = USERPOOLID;
      }
      resolve(user);
    } catch (error) {
      resolve({ error: "failed" });
    }
  });
}

getUser(attributeName, attributeValue);