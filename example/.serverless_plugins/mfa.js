'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      mfa: {
        usage: 'Helps you start your first Serverless plugin',
        lifecycleEvents: [
          'sts',
        ],
        options: {
          arn: {
            usage:
              'Specify Arn or Serial Number of your MFA'
              + '(e.g. "--arn \'arn:aws:iam::123456789012:sms-mfa/username\'" or "-a \'arn:aws:iam::123456789012:sms-mfa/username\'")',
            required: true,
            shortcut: 'a',
          },
          token: {
            usage:
              'Specify token your MFA'
              + '(e.g. "--token {your_token}" or "-t {your_token}")',
            required: true,
            shortcut: 't',
          },
        },
      },
    };

    this.hooks = {
      'mfa:sts': this.mfa.bind(this),
    };
  }

  async mfa() {
    this.serverless.cli.log('Calling Credential');
    const credentials = this.serverless.providers.aws.getCredentials();

    this.serverless.cli.log('Called Credential' + credentials);

    this.sts = new this.serverless.providers.aws.sdk.STS(credentials);

    this.serverless.cli.log('Called new STS' + this.sts);


    var params = {
      DurationSeconds: 3600,
      SerialNumber: this.options['arn'],
      TokenCode: this.options['token']
    };

    this.serverless.cli.log('params');
    this.serverless.cli.log(this.options['arn']);
    this.serverless.cli.log(this.options['token']);

    let stsCredentials = await this.sts.getSessionToken(params).promise();
    this.serverless.cli.log('sts success' );

    process.env.AWS_ACCESS_KEY_ID = stsCredentials.Credentials.AccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = stsCredentials.Credentials.SecretAccessKey;
    process.env.AWS_SESSION_TOKEN = stsCredentials.Credentials.SessionToken;

    this.serverless.cli.log('stsCredentials' + stsCredentials.Credentials.AccessKeyId);



  }


}

module.exports = ServerlessPlugin;
