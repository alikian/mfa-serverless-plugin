# mfa-serverless-plugin
MFA Serverless plugin


## Set following environments variables

AWS_MFA_SERIAL_NUMBER=arn:aws:iam::12345678910:mfa/mfa_user
AWS_MFA_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

## install plugin
```
npm install --save mfa-serverless-plugin
```

## add plugin to your serverless.yml

```
plugins:
  - mfa-serverless-plugin
```