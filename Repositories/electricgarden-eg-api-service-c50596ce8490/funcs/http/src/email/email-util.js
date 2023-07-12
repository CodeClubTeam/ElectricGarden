const sg = require('@sendgrid/mail');
const emailConfig = require('./email-config')();

sg.setApiKey(emailConfig);
sg.setSubstitutionWrappers('{{', '}}');

exports.sendWelcomeEmail = (req, createUser) => {
  req.logger.log('Welcome Email called');

  const welcomeObject = {
    userName: createUser.name.toString(),
    userURL: 'https://app.electricgarden.nz',
  };

  const msg = {
    from: 'Electric Garden Team <noreply@electricgarden.nz>',
    to: createUser.email,
    subject: 'Welcome to the Electric Garden',
    templateId: '18441a9f-5f6d-4b70-828a-a0afcccc9385',
    substitutions: welcomeObject,
  };

  sg.send(msg)
    .then(() => {
      //Celebrate
    })
    .catch((error) => {
      //Log friendly error
      req.logger.log(error.toString());
    });
};
