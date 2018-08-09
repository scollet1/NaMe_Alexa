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
    const attrMan = handlerInput.attributesManager;
    const attr = await attrMan.getPersistantAttributes || {};
    if (Object.keys(attr) === 0) {
      attr.name = 'default';
      attr.gender = 'default';
      attr.startedSkill = false;
    }
    attrMan.setSessionAttributes(attr);
    console.log('ATTRIBUTES === ', attrMan.getSessionAttributes());
    const speechIntro = 'Welcome to Name Analysis. Everyone has meaning behind their names. For instance, Alexa means this: ';
    var speechExample;
    var speechText;
    const speechCap = 'Please tell me your first name...';
    await searchName(URLGET + 'female/' + 'Alexa.htm').then(function(result) {
      speechExample = result;
    });
    speechText = speechIntro + speechExample + speechCap;
    attrMan.setSessionAttributes(attr);
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(speechText)
      .getResponse();
  },
};

/*
 *
 * SOURCED FROM : https://github.com/alexa/skill-sample-nodejs-highlowgame/blob/master/lambda/custom/index.js
 *
 */

const YesIntent = {
  canHandle(handlerInput) {
    // only start a new game if yes is said when not playing a game.
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.startedSkill = true;

    return responseBuilder
      .speak('Tell me your name.')
      .reprompt('Say your name.')
      .getResponse();
  },
};


const NoIntent = {
  canHandle(handlerInput) {
    // only treat no as an exit when outside a game
    let isCurrentlyPlaying = false;
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.startedSkill &&
        sessionAttributes.startedSkill == true) {
      isCurrentlyPlaying = true;
    }

    return !isCurrentlyPlaying && request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.startedSkill = false;
    attributesManager.setPersistentAttributes(sessionAttributes);

    //await attributesManager.savePersistentAttributes();

    return responseBuilder.speak('Ok, see you next time!').getResponse();
  },
};

/*
 *
 * END SOURCE
 *
 */

const NameMeaningIntentHandler = {
  canHandle(handlerInput) {
    let isStarted = false;
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();
    console.log(sessAttr);
    
    if (sessAttr.startedSkill &&
        sessAttr.StartedSkill == true) {
      isStarted = true;
    }
    return isStarted && handlerInput.requestEnvelope.request.type === 'IntentRequest';/* &&
	   handlerInput.requestEnvelope.request.intent.name === 'NameMeaningIntent';  */
  },
  async handle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();
    console.log("SESSATTR === ", sessAttr);
    sessAttr.name = 'default';
    sessAttr.gender = 'default';
    const speechIntro = 'Your name means: ';
    var userNameMeans;

    searchName(URLGET + 'female/' + 'Alexa.htm').then(function(result) {
      userNameMeans = result;
    });

    var speechText = speechIntro + userNameMeans;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(speechText)
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
    NameMeaningIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    YesIntent,
    NoIntent
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
