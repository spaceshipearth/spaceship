import AWS from 'aws-sdk';
AWS.config.update({ region: 'us-west-2' });

export async function send({ to, subject, text, html }) {
  console.log(`Sending email to ${to} with subject ${subject}`);
  // Create sendEmail params
  var params = {
    Destination: {
      /* required */
      CcAddresses: [],
      ToAddresses: to.split(',')
    },
    Message: {
      /* required */
      Body: {
        /* required */
        // added later
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject
      }
    },
    Source: "Spaceship Earth Crew <team@myspaceshipearth.com>" /* required */,
    ReplyToAddresses: ["team@myspaceshipearth.com"]
  };

  if (html) {
    params.Message.Body.Html = {
      Charset: 'UTF-8',
      Data: html,
    };
  }
  if (text) {
    params.Message.Body.Text = {
      Charset: 'UTF-8',
      Data: text,
    };
  }

  // Create the promise and SES service object
  return new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
}
