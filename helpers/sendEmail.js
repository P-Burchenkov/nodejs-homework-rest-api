const formData = require("form-data");
const Mailgun = require("mailgun.js");

const mailgun = new Mailgun(formData);

const { MAILGUN_API_KEY } = process.env;

const mg = mailgun.client({
  username: "api",
  key: MAILGUN_API_KEY,
});

const sendEmail = (data) => {
  return new Promise(function (resolve, reject) {
    mg.messages
      .create("sandbox639142e59b384903ac63b7b10f9c3c5b.mailgun.org", {
        from: "Excited User <mailgun@sandbox-123.mailgun.org>",
        ...data,
      })
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

module.exports = sendEmail;
