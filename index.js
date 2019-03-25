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
    
    if (!process.env.AWS_MFA_KEY){
      this.serverless.cli.log('AWS_MFA_KEY  environment variable is missing, skip mfa');
      return;
    }
    if (!process.env.AWS_MFA_SERIAL_NUMBER){
      this.serverless.cli.log('AWS_MFA_SERIAL_NUMBER environment variable is missing, skip mfa');
      return;
    }

    this.serverless.cli.log('get token');
    
    // Get Token
    var token = speakeasy.totp({
      secret: process.env.AWS_MFA_KEY,
      encoding: 'base32'
    });

    // Get current credential for STS getSession
    const credentials = this.serverless.providers.aws.getCredentials();

    this.sts = new this.serverless.providers.aws.sdk.STS(credentials);

    var params = {
      DurationSeconds: 3600,
      SerialNumber: process.env.AWS_MFA_SERIAL_NUMBER,
      TokenCode: token
    };

    let stsCredentials = await this.sts.getSessionToken(params).promise();
    this.serverless.cli.log('sts success' );

    // Clear cached credentials
    this.serverless.providers.aws.cachedCredentials = null;

    // Set AWS CLI Environment variable, any concequence AWS call will use these crendentials
    process.env.AWS_ACCESS_KEY_ID = stsCredentials.Credentials.AccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = stsCredentials.Credentials.SecretAccessKey;
    process.env.AWS_SESSION_TOKEN = stsCredentials.Credentials.SessionToken;

  }


}

module.exports = ServerlessPlugin;
