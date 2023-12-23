const axios = require("axios");
const crypto = require("crypto-js");
const uniqid = require("uniqid");

function getAmzDate(dateStr) {
  const chars = [":", "-"];
  for (let i = 0; i < chars.length; i++) {
    while (dateStr.indexOf(chars[i]) != -1) {
      dateStr = dateStr.replace(chars[i], "");
    }
  }
  dateStr = dateStr.split(".")[0] + "Z";
  return dateStr;
}
function getSignatureKey(Crypto, key, dateStamp, regionName, serviceName) {
  const kDate = Crypto.HmacSHA256(dateStamp, "AWS4" + key);
  const kRegion = Crypto.HmacSHA256(regionName, kDate);
  const kService = Crypto.HmacSHA256(serviceName, kRegion);
  const kSigning = Crypto.HmacSHA256("aws4_request", kService);
  return kSigning;
}
const getAuthHeaders = ({ payload, path }) => {
  const access_key = process.env.AWS_ACCESS_KEY_ID;
  const secret_key = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_PINPOINT_REGION;
  const myService = "mobiletargeting";
  const myMethod = "POST";
  const url = process.env.AWS_PINPOINT_ENDPOINT;
  const myPath = path;
  const amzDate = getAmzDate(new Date().toISOString());
  const authDate = amzDate.split("T")[0];
  const hashedPayload = crypto.SHA256(payload).toString();
  const canonicalReq = `${myMethod}\n${myPath}\n\ncontent-type:application/json\nhost:${url}\nx-amz-content-sha256:${hashedPayload}\nx-amz-date:${amzDate}\n\ncontent-type;host;x-amz-content-sha256;x-amz-date\n${hashedPayload}`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${authDate}/${region}/${myService}/aws4_request\n${crypto.SHA256(
    canonicalReq
  )}`;
  const signingKey = getSignatureKey(
    crypto,
    secret_key,
    authDate,
    region,
    myService
  );
  const authKey = crypto.HmacSHA256(stringToSign, signingKey);
  const authString = `AWS4-HMAC-SHA256 Credential=${access_key}/${authDate}/${region}/${myService}/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=${authKey}`;
  return {
    "Content-Type": "application/json",
    "X-Amz-Content-Sha256": hashedPayload,
    "X-Amz-Date": amzDate,
    Authorization: authString,
  };
};

const SendOTP = (phone) => {
  return new Promise(async (resolve, reject) => {
    let ReferenceId = uniqid();
    resolve({ ReferenceId });
    // const data = JSON.stringify({
    //   Channel: "SMS",
    //   BrandName: "Vvarin",
    //   CodeLength: 6,
    //   ValidityPeriod: 10,
    //   AllowedAttempts: 3,
    //   Language: "en-US",
    //   OriginationIdentity: process.env.AWS_PINPOINT_SENDER_ID,
    //   DestinationIdentity: phone,
    //   ReferenceId,
    // });
    // const path = `/v1/apps/${process.env.AWS_PINPOINT_PROJECT_ID}/otp`;
    // const headers = await getAuthHeaders({ payload: data, path });
    // axios({
    //   method: "post",
    //   url: `https://${process.env.AWS_PINPOINT_ENDPOINT}${path}`,
    //   headers,
    //   data,
    // })
    //   .then(function (response) {
    //     resolve({ ...response.data, ReferenceId });
    //   })
    //   .catch(function (error) {
    //     console.log(error.response.data);
    //     reject(error.response.data);
    //   });
  });
};

const VerifyOTP = (phone, ReferenceId, Otp) => {
  return new Promise(async (resolve, reject) => {
    resolve({ Valid: true });
    // const data = JSON.stringify({
    //   DestinationIdentity: phone,
    //   ReferenceId,
    //   Otp,
    // });
    // const path = `/v1/apps/${process.env.AWS_PINPOINT_PROJECT_ID}/verify-otp`;
    // const headers = await getAuthHeaders({ payload: data, path });
    // axios({
    //   method: "post",
    //   url: `https://${process.env.AWS_PINPOINT_ENDPOINT}${path}`,
    //   headers,
    //   data,
    // })
    //   .then(function (response) {
    //     resolve(response.data);
    //   })
    //   .catch(function (error) {
    //     console.log(error.response.data);
    //     reject(error.response.data);
    //   });
  });
};

module.exports = { SendOTP, VerifyOTP };
