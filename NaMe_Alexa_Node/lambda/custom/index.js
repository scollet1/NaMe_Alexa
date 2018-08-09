/* eslint-disable  func-names */
/* eslint-disable  no-console */

const cheerio = require('cheerio');
const request = require('request');
const Alexa = require('ask-sdk-core');
const URLGET = 'https://www.kabalarians.com/name-meanings/names/';

function reqGet(url) {
  var resp;

  return new Promise(function(resolve, reject) {
    request(url, function (error, response, body) {
      resp = body;
      resolve(resp);
    });
  });
}

async function searchName(url) {
  var result = await reqGet(url);
  var $ = cheerio.load(result);
  var res = [];
  $('#headerOL li').each(function() {
    res.push($(this).text());
  });
  return res;
}

/*var re;
searchName(URLGET + 'female/' + 'Alexa.htm').then(function(result) {
  re = result;
  console.log(re);
});*/

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    
    const speechIntro = 'Welcome to Name Analysis. Everyone has meaning behind their names. For instance, Alexa means this: ';
    var speechExample;
    var speechText;
    const speechCap = 'Please tell me your first name...';
    searchName(URLGET + 'female/' + 'Alexa.htm').then(function(result) {
      speechExample = result;
    });
    speechText = speechIntro + speechExample + speechCap;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(speechText)
      .getResponse();
  },
};

const NameMeaningIntent = {
  canHandle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    attrMan.setSessionAttributes('name', 'gender');
    const sessAttr = attrMan.getSessionAttributes();
    console.log(sessAttr);
    return handlerInput.requestEnvelope.request.type === 'IntentRequest';
//      && handlerInput.requestEnvelope.request.intent.name === 'NameMeaningIntent';
  },
  async handle(handlerInput) {
    sessAttr.name = 'default';
    sessAttr.gender = 'default';
    var speechQuery = reqGet(URLGET+this.attributes.gender+'/'+this.attributes.name+'.htm',function(response){doStuff(response[0]);});/*perform GET
                      (his.attributes.name, this.attributes.gender)*/

    return handlerInput.responseBuilder
      .speak('Your name means: ' + speechQuery)
      .withSimpleCard('Your name means: ', speechQuery)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    NameMeaningIntent,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

