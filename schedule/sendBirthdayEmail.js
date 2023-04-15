const { knex } = require("./../db/ConnectKnex");
const axios = require("axios");
const moment = require("moment-timezone");
const { insertQueue, startWorker } = require("../queue/worker");

async function sendBirthdayEmails(locationParam) {
  const bday = moment.tz(locationParam);
  console.log(bday);
  knex("users")
    .select("*")
    .where({ location: locationParam })
    .where(knex.raw("EXTRACT(MONTH FROM birthday_date) = ?", bday.format("MM")))
    .andWhere(
      knex.raw("EXTRACT(DAY FROM birthday_date) = ?", bday.format("DD"))
    )
    .then((users) => {
      console.log(`Found ${users.length} users`);
      const promises = users.map(async (user) => {
        const { id, first_name, last_name, birthday_date, location } = user;
        try {
          const response = await axios.post(
            "https://email-service.digitalenvision.com.au/send-email",
            {
              email: "test@digitalenvision.com.au",
              message: `Hey, ${first_name} ${last_name} 🎉🎂🎁 it's your birthday! 🎁🎂🎉`,
            }
          );
          console.log(
            `Sent email to ${first_name} ${last_name} (${id}) 🎉🎂🎁 it's your birthday! 🎁🎂🎉`,
            response.data
          );
        } catch (error) {
          console.error(
            `Failed to send email to ${first_name} ${last_name} (${id})`,
            error.message
          );
          // Send email to RabbitMQ for processing by a worker
          await insertQueue(user);
          console.log(`Sent email to RabbitMQ for processing`);
        }
      });
      Promise.all(promises).then(() => {
        console.log("Finished sending birthday emails");
      });
    });
}

module.exports = {
  sendBirthdayEmails,
};
