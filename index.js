"use strict";
require("dotenv").config();
const dynamoDb = require("./services/dynamo.service");
const ajvO = require("ajv");
const ajvRq = new ajvO();
const schemaCreateInventoryRq = require("./schemas/rqCreateInventorySchema.json");

const validateCreateRq = ajvRq.compile(schemaCreateInventoryRq);

module.exports.createInventony = async (event) => {
  const data = JSON.parse(event.body);
  let valid = validateCreateRq(data);

  if (!valid) {
    return {
      statusCode: 406,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Empty fields are not accepted",
        details: validateCreateRq.errors[0],
      }),
    };
  }
  const { fullName, description, quantity, nit } = data;
  const creationDate = new Date().toDateString();
  const updateDate = creationDate;
  const PK = "#INVENTORIES";
  const SK = "#INVENTORY#" + nit + "#" + fullName;
  const payload = {
    PK,
    SK,
    fullName,
    description,
    quantity,
    creationDate,
    updateDate,
  };

  try {
    await dynamoDb.putItem(
      payload,
      process.env.TABLE_NAME + "-" + process.env.STAGE
    );
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      error: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({ message: "success", payload }),
  };
};
