/**
 * AWS Route53 DNS Management Module
 * Configurable wrapper for AWS Route53 operations
 * 
 * Usage:
 *   const { createRoute53Client } = require('./.windsurf/tools/aws/route53');
 *   
 *   const route53 = createRoute53Client({
 *     region: 'eu-west-2',
 *     // Credentials from env vars: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *     // Or explicit:
 *     accessKeyId: 'xxx',
 *     secretAccessKey: 'xxx'
 *   });
 *   
 *   // List hosted zones
 *   const zones = await route53.listHostedZones();
 *   
 *   // Create CNAME record
 *   await route53.createCnameRecord('zantha.im', 'cs-bot', 'discord-zantha-bot-production.up.railway.app');
 */

const { Route53Client, ListHostedZonesCommand, ListResourceRecordSetsCommand, ChangeResourceRecordSetsCommand } = require('@aws-sdk/client-route-53');
const credentials = require('../credentials');

/**
 * Create Route53 client with configurable credentials
 * @param {Object} config
 * @param {string} config.region - AWS region (default: from config or us-east-1)
 * @param {string} config.accessKeyId - AWS access key (or use env var or shared config)
 * @param {string} config.secretAccessKey - AWS secret key (or use env var or shared config)
 * @returns {Object} Route53 client wrapper
 */
function createRoute53Client(config = {}) {
  const creds = credentials.get('aws') || {};
  
  const region = config.region || creds.region || 'us-east-1';
  const accessKeyId = config.accessKeyId || creds.accessKeyId;
  const secretAccessKey = config.secretAccessKey || creds.secretAccessKey;
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'AWS credentials required. Set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY env vars, ' +
      'pass in config, or add to .windsurf/config/credentials.json'
    );
  }
  
  const client = new Route53Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
  
  return {
    /**
     * List all hosted zones
     * @returns {Promise<Array>} List of hosted zones
     */
    async listHostedZones() {
      const command = new ListHostedZonesCommand({});
      const response = await client.send(command);
      return response.HostedZones.map(zone => ({
        id: zone.Id.replace('/hostedzone/', ''),
        name: zone.Name,
        recordCount: zone.ResourceRecordSetCount,
        comment: zone.Config?.Comment
      }));
    },
    
    /**
     * Get hosted zone ID by domain name
     * @param {string} domainName - Domain name (e.g., 'zantha.im')
     * @returns {Promise<string|null>} Hosted zone ID or null
     */
    async getHostedZoneId(domainName) {
      const zones = await this.listHostedZones();
      const normalizedDomain = domainName.endsWith('.') ? domainName : `${domainName}.`;
      const zone = zones.find(z => z.name === normalizedDomain);
      return zone ? zone.id : null;
    },
    
    /**
     * List DNS records for a hosted zone
     * @param {string} hostedZoneId - Hosted zone ID
     * @param {string} filterName - Optional: filter by record name
     * @returns {Promise<Array>} List of DNS records
     */
    async listRecords(hostedZoneId, filterName = null) {
      const command = new ListResourceRecordSetsCommand({
        HostedZoneId: hostedZoneId,
        StartRecordName: filterName
      });
      const response = await client.send(command);
      return response.ResourceRecordSets.map(record => ({
        name: record.Name,
        type: record.Type,
        ttl: record.TTL,
        values: record.ResourceRecords?.map(r => r.Value) || [],
        aliasTarget: record.AliasTarget ? {
          dnsName: record.AliasTarget.DNSName,
          hostedZoneId: record.AliasTarget.HostedZoneId
        } : null
      }));
    },
    
    /**
     * Create or update a CNAME record
     * @param {string} domainName - Base domain (e.g., 'zantha.im')
     * @param {string} subdomain - Subdomain (e.g., 'cs-bot')
     * @param {string} target - Target hostname (e.g., 'discord-zantha-bot-production.up.railway.app')
     * @param {number} ttl - TTL in seconds (default: 300)
     * @returns {Promise<Object>} Change info
     */
    async createCnameRecord(domainName, subdomain, target, ttl = 300) {
      const hostedZoneId = await this.getHostedZoneId(domainName);
      if (!hostedZoneId) {
        throw new Error(`Hosted zone not found for domain: ${domainName}`);
      }
      
      const recordName = `${subdomain}.${domainName}`;
      const normalizedTarget = target.endsWith('.') ? target : `${target}.`;
      
      const command = new ChangeResourceRecordSetsCommand({
        HostedZoneId: hostedZoneId,
        ChangeBatch: {
          Comment: `Created by AI Advisor System Administrator`,
          Changes: [{
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: recordName,
              Type: 'CNAME',
              TTL: ttl,
              ResourceRecords: [{ Value: normalizedTarget }]
            }
          }]
        }
      });
      
      const response = await client.send(command);
      return {
        changeId: response.ChangeInfo.Id,
        status: response.ChangeInfo.Status,
        submittedAt: response.ChangeInfo.SubmittedAt,
        record: {
          name: recordName,
          type: 'CNAME',
          target: target,
          ttl
        }
      };
    },
    
    /**
     * Create or update an A record
     * @param {string} domainName - Base domain
     * @param {string} subdomain - Subdomain (use '@' or '' for apex)
     * @param {string|string[]} ipAddresses - IP address(es)
     * @param {number} ttl - TTL in seconds (default: 300)
     * @returns {Promise<Object>} Change info
     */
    async createARecord(domainName, subdomain, ipAddresses, ttl = 300) {
      const hostedZoneId = await this.getHostedZoneId(domainName);
      if (!hostedZoneId) {
        throw new Error(`Hosted zone not found for domain: ${domainName}`);
      }
      
      const ips = Array.isArray(ipAddresses) ? ipAddresses : [ipAddresses];
      const recordName = subdomain && subdomain !== '@' ? `${subdomain}.${domainName}` : domainName;
      
      const command = new ChangeResourceRecordSetsCommand({
        HostedZoneId: hostedZoneId,
        ChangeBatch: {
          Comment: `Created by AI Advisor System Administrator`,
          Changes: [{
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: recordName,
              Type: 'A',
              TTL: ttl,
              ResourceRecords: ips.map(ip => ({ Value: ip }))
            }
          }]
        }
      });
      
      const response = await client.send(command);
      return {
        changeId: response.ChangeInfo.Id,
        status: response.ChangeInfo.Status,
        submittedAt: response.ChangeInfo.SubmittedAt,
        record: {
          name: recordName,
          type: 'A',
          values: ips,
          ttl
        }
      };
    },
    
    /**
     * Delete a DNS record
     * @param {string} domainName - Base domain
     * @param {string} subdomain - Subdomain
     * @param {string} type - Record type (CNAME, A, etc.)
     * @returns {Promise<Object>} Change info
     */
    async deleteRecord(domainName, subdomain, type) {
      const hostedZoneId = await this.getHostedZoneId(domainName);
      if (!hostedZoneId) {
        throw new Error(`Hosted zone not found for domain: ${domainName}`);
      }
      
      const recordName = `${subdomain}.${domainName}`;
      const normalizedName = recordName.endsWith('.') ? recordName : `${recordName}.`;
      
      // First, get the current record to know its values
      const records = await this.listRecords(hostedZoneId, recordName);
      const existingRecord = records.find(r => r.name === normalizedName && r.type === type);
      
      if (!existingRecord) {
        throw new Error(`Record not found: ${recordName} (${type})`);
      }
      
      const command = new ChangeResourceRecordSetsCommand({
        HostedZoneId: hostedZoneId,
        ChangeBatch: {
          Comment: `Deleted by AI Advisor System Administrator`,
          Changes: [{
            Action: 'DELETE',
            ResourceRecordSet: {
              Name: normalizedName,
              Type: type,
              TTL: existingRecord.ttl,
              ResourceRecords: existingRecord.values.map(v => ({ Value: v }))
            }
          }]
        }
      });
      
      const response = await client.send(command);
      return {
        changeId: response.ChangeInfo.Id,
        status: response.ChangeInfo.Status,
        deleted: { name: recordName, type }
      };
    },
    
    /**
     * Get the underlying AWS SDK client for advanced operations
     */
    getClient() {
      return client;
    }
  };
}

module.exports = {
  createRoute53Client
};
