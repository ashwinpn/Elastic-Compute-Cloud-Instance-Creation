//Using the AWS SDK for JavaScript
var AWS = require('aws-sdk');

//Instance ID of the EC2 instance created will be stored here
var instanceId = null;

//Reading the credentials file located at .aws/credentials
var credentials = new AWS.SharedIniFileCredentials({profile:'Rahul'}, (err) =>{
  console.log("Credentials file not present in location .aws/credentials");
});

//Setting the credentials to the AWS Global Configuration Variable
AWS.config.credentials = credentials;

//Creating the AWS EC2 Object
var ec2 = new AWS.EC2({region: 'us-east-1', maxRetries: 15, apiVersion: '2016-11-15'});

// Setting the properties of the EC2 instance being created
var ec2InstanceParams = {
   ImageId: 'ami-06b5810be11add0e2',
   InstanceType: 't1.micro',
   KeyName: 'Raga',
   MinCount: 1,
   MaxCount: 1
};

//Creating the EC2 instance, displaying the details of all the EC2 instance,Terminating the EC2 instance
var ec2InstancePromise = ec2.runInstances(ec2InstanceParams).promise();
ec2InstancePromise.then((data) => {
  instanceId = data.Instances[0].InstanceId;
  console.log("Created instance", instanceId);
  return ec2.describeInstances({InstanceIds: [null]}).promise();
})
.then((data) => {
  console.log("Details of all the EC2 instances");
  data.Reservations.forEach(element => {
    console.log("InstanceId: " + element.Instances[0].InstanceId + "  Region: " + element.Instances[0].Placement.AvailabilityZone + "  Public IP: " + element.Instances[0].PublicIpAddress);
  });
  return ec2.terminateInstances({InstanceIds: [instanceId]}).promise();
})
.then((data) =>{
  console.log("Terminated instance", instanceId);
  console.log(data);
})
.catch((err) => console.error(err, err.stack));
