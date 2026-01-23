/**
 * AWS Tools Index
 * 
 * Usage:
 *   const aws = require('.windsurf/tools/aws');
 *   const route53 = aws.createRoute53Client({ region: 'eu-west-2' });
 */

const { createRoute53Client } = require('./route53');

module.exports = {
  createRoute53Client
};
