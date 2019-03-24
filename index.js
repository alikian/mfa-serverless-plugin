'use strict';

const speakeasy = require("speakeasy");

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'before:deploy:deploy': this.mfa.bind(this),
    };
  }

  async mfa() {
    this.serverless.cli.log('get token');
    
    if (!process.env.AWS_MFA_KEY){
      this.serverless.cli.log('AWS_MFA_KEY does not existing skipping mfa');
      return;
    }
    if (!process.env.AWS_MFA_SERIAL_NUMBER){
      this.serverless.cli.log('AWS_MFA_SERIAL_NUMBER does not existing skipping mfa');
      return;
    }

    
    var token = speakeasy.totp({
      secret: process.env.AWS_MFA_KEY,
      encoding: 'base32'
    });
    
    const credentials = this.serverless.providers.aws.getCredentials();

    this.sts = new this.serverless.providers.aws.sdk.STS(credentials);

    var params = {
      DurationSeconds: 3600,
      SerialNumber: process.env.AWS_MFA_SERIAL_NUMBER,
      TokenCode: token
    };

    let stsCredentials = await this.sts.getSessionToken(params).promise();
    this.serverless.cli.log('sts success' );

    process.env.AWS_ACCESS_KEY_ID = stsCredentials.Credentials.AccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = stsCredentials.Credentials.SecretAccessKey;
    process.env.AWS_SESSION_TOKEN = stsCredentials.Credentials.SessionToken;

    // Clear cached credentials
    this.serverless.providers.aws.cachedCredentials = null;

  }


}

module.exports = ServerlessPlugin;
