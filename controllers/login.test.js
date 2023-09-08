// Entered correct data
// 1. Responce must return token
// 2. Responce must have status code 200
// 3. Responce must return an object with two fields: {email, subscription} with datatype === string

// Entered incorrect data
// 1. If email is not valid return status code 401, message:'Email or password is wrong'
// 2. If password is wrong return status code 401, message:'Email or password is wrong'
// 3. If field password is empty return status code 400, message:'\"password\" is required'
// 4. If field email is empty return status code 400, message:'\"email\" is required'

require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

const { DB_HOST } = process.env;

describe("login user, Entered correct data ", () => {
  beforeAll(async () => {
    await mongoose
      .connect(DB_HOST)
      .then(() => console.log("DB Connected"))
      .catch((err) => {
        console.log(err);
      });
  });

  it("Responce must return token", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "p.burchenkov@ukr.net",
      password: "123456",
    });
    expect(
      response.body.token !== null && response.body.token !== undefined
    ).toBe(true);
  });

  it("Responce must have status code 200", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "p.burchenkov@ukr.net",
      password: "123456",
    });
    expect(response.statusCode).toBe(200);
  });

  it("Responce must return an object with two fields: {email, subscription} with datatype === string", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "p.burchenkov@ukr.net",
      password: "123456",
    });
    expect(
      typeof response.body.user.email === "string" &&
        typeof response.body.user.subscription === "string"
    ).toBe(true);
  });

  afterAll(async () => {
    await mongoose.disconnect(DB_HOST).then(() => {});
  });
});
