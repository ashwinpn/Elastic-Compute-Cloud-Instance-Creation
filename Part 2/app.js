// Using the AWS SDK for JavaScript
var AWS = require('aws-sdk');

// Imports for creating the key pair file for SSH login
var fs = require('fs');
const util = require("util");
const writeFile = util.promisify(fs.writeFile);

// Instance ID of the EC2 instance created will be stored here
var instanceId = null;

// Reading the credentials file located at .aws/credentials
var credentials = new AWS.SharedIniFileCredentials({profile:'Rahul'}, (err) =>{
  console.log("Credentials file not present in location .aws/credentials");
});

// Setting the credentials to the AWS Global Configuration Variable
AWS.config.credentials = credentials;

// Creating the AWS EC2 Object
var ec2 = new AWS.EC2({region: 'us-east-1', maxRetries: 15, apiVersion: '2016-11-15'});

// Setting the name of key pair to be created as Rahul
var keyPairParams = {
  KeyName: 'Rahul'
};

// Setting the details of the security group i.e. GroupName as Rahul
var securityGroupParams = {
  Description: 'Rahul',
  GroupName: 'Rahul'
};

// Adding rule to the security group
var securityGroupParamsIngress = {
  GroupName: 'Rahul',
  IpPermissions:[
    {
      IpProtocol: "tcp",
      FromPort: 22,
      ToPort: 22,
      IpRanges: [{"CidrIp":"0.0.0.0/0"}]
    }
  ]
};

// Setting the properties of the EC2 instance being created
var ec2InstanceParams = {
  ImageId: 'ami-06b5810be11add0e2',
  InstanceType: 't1.micro',
  KeyName: 'Rahul',
  SecurityGroups: [
    'Rahul'
  ],
  MinCount: 1,
  MaxCount: 1
};

// Creating the key pair,key pair file,security group,EC2 instance
// Displaying details of all the EC2 Instances
// Terminating EC2 instance that was created
var createKeyPairPromise = ec2.createKeyPair(keyPairParams).promise();
createKeyPairPromise.then((data) => {
  console.log("Key Pair Generated Successfully");
  // console.log(data);
  writeFile("/Users/Rahul/Desktop/Mini_Homework_Part2/Rahul.pem", data.KeyMaterial);
})
.then((data) =>{
  console.log("Key Pair file created successfully in location /Users/Rahul/Desktop/Mini_Homework_Part2/Rahul.pem");
  return ec2.createSecurityGroup(securityGroupParams).promise();
})
.then((data) => {
  console.log("Security Group Created");
  //console.log(data);
  return ec2.authorizeSecurityGroupIngress(securityGroupParamsIngress).promise();
})
.then((data) =>{
  console.log("Security Group Ingress Successfully Set", data);
  return ec2.runInstances(ec2InstanceParams).promise();
})
.then((data) => {
  //console.log(data);
  instanceId = data.Instances[0].InstanceId;
  console.log("Created EC2 instance", instanceId);
  return ec2.describeInstances({InstanceIds: [instanceId]}).promise();
})
.then((data) => {
  console.log("Details of the created EC2 instance");
  data.Reservations.forEach(element => {
    console.log("InstanceId: " + element.Instances[0].InstanceId + "  Region: " + element.Instances[0].Placement.AvailabilityZone + "  Public IP: " + element.Instances[0].PublicIpAddress);
  });
 return ec2.terminateInstances({InstanceIds: [instanceId]}).promise();
})
.then((data) =>{
  console.log("Terminated EC2 instance", instanceId);
  console.log(data);
})
.catch((err) => console.error(err, err.stack));
