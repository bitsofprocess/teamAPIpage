const AWS = require("aws-sdk");
// require("dotenv").config;
// const documentClient = new AWS.DynamoDB.DocumentClient();
// const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const myCredentials = {
  accessKeyId: process.argv[2],
  secretAccessKey: process.argv[3],
};

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

            // console.log(`data: ${JSON.stringify(data, null, 2)}`);
            // console.log(`data.Users: ${JSON.stringify(data.Users, null, 2)}`);


            // console.log(data.Users[0]);
            // console.log(data.Users.map((element) => {

            // }))

            // map attribute name to attribute value
              // data.Users[0].Attributes.forEach((attribute) => {
              //   user[attribute.Name] = attribute.Value;
              // });

              // console.log(data.Users);
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
                // let identities = JSON.parse(element.identities[0]);
                // console.log(identities);
                // let parsed_identities = JSON.parse(identities);
                // console.log(parsed_identities)
                // console.log(JSON.parse(data.Users[].identities)[0].providerName)
              })
              
              data.Users.forEach((element,index) => {
                console.log(data.Users[index]);
              })

            // if (data && data.Users && data.Users.length == 0) {
            //   reject("failed");
            // } else if (attributesToGet.length == 0) {
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
      resolve(user);
    } catch (error) {
      resolve({ error: "failed" });
    }
  });
}

// module.exports = getUserAttributes;

getUserAttributes({ attributesToGet: [], email: "jfsimmon@usc.edu" })