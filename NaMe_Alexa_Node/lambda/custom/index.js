/* eslint-disable  func-names */
/* eslint-disable  no-console */

const cheerio = require('cheerio');
const request = require('request');
const Alexa = require('ask-sdk-core');
const URLGET = 'https://www.kabalarians.com/name-meanings/names/';
const items = ['Male', 'Female'];

function reqGet(url) {
  /* reqGet ingests a p(URL) and makes an async GET
   * request to the web address. It returns a
   * resolved response in the form of an HTML body
   */
  var resp;

  return new Promise(function(resolve, reject) {
    request(url, function (error, response, body) {
      resp = body;
      resolve(resp);
    });
  });
}

async function searchName(url) {
  /* searchName ingests a p(URL),
   * parses the HTML DOM and
   * returns the second index
   * to our string array
   */
  var result = await reqGet(url);
  var $ = cheerio.load(result);
  var res = [];

  $('#headerOL li').each(function() {
    res.push($(this).text());
  });
  return res[1];
}

/*
 * TEST ME *********************************************************\/
 * 

var re;
searchName(URLGET + 'female/' + 'Alexa.htm').then(function(result) {
  re = result;
  console.log(re);
});

*
* ******************************************************************\/
*/

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    const attr = await attrMan.getSessiontAttributes || {};
    if (Object.keys(attr) === 0) {
      attr.name         = 'default';
      attr.gender       = 'default';
      attr.startedSkill = false;
    }
    attrMan.setSessionAttributes(attr);
    console.log('ATTRIBUTES === ', await attrMan.getSessionAttributes());
    const speechIntro = 'Welcome to Name Meaning. Everyone has meaning behind their names. For instance, Alexa means this: ';
    var speechExample;
    var speechText;
    const speechCap = 'Would you like to know the meaning behind your first name?';
    await searchName(URLGET + 'female/' + 'Alexa.htm').then(function(result) {
      speechExample = result;
    });
    speechText = speechIntro + speechExample + speechCap;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Yes or no to confirm, quit or exit to leave.')
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
    let isStarted = false;
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.startedSkill &&
	sessionAttributes.startedSkill == true) {
          isStarted = true;
    }

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessAttr = attrMan.getSessionAttributes();

    sessAttr.name         = 'default';
    sessAttr.gender       = 'default';
    sessAttr.startedSkill = true;

    return responseBuilder
      .speak('Okay, tell me your name.')
      .reprompt()
      .getResponse();
  },
};


const NoIntent = {
  canHandle(handlerInput) {
    // only treat no as an exit when outside a game
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = await attributesManager.getSessionAttributes();

    sessionAttributes.startedSkill = false;

    return responseBuilder.speak('Ok, see you next time!').getResponse();
  },
};

/*
 *
 * END SOURCE
 *
 */

const GenderIntentHandler = {
  canHandle(handlerInput) {
    let isStarted = false;
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();

    return sessAttr.startedSkill && handlerInput.requestEnvelope.request.type === 'IntentRequest'
           && handlerInput.requestEnvelope.request.intent.name === 'GenderIntent';
  },
  async handle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();
    var userNameMeans;

    if (sessAttr.gender === 'default') {
      sessAttr.gender = handlerInput.requestEnvelope
		        .request.intent.slots.Gender
		        .value.replace(/^\w/, c => c.toUpperCase());
      if (sessAttr.gender !== 'Male' && sessAttr.gender !== 'Female') {
        sessAttr.gender = items[Math.floor(Math.random()*items.length)];
      }
    }

    if (sessAttr.name && sessAttr.name !== 'default') {
      await searchName(URLGET + sessAttr.gender + '/' + sessAttr.name + '.htm').then(function(result) {
        userNameMeans = result;
      });

      const speechIntro = sessAttr.name + ' means: ';
      var speechText = speechIntro + userNameMeans;

      if (!userNameMeans || userNameMeans === 'undefined') {
        return handlerInput.responseBuilder
          .speak('I\'m sorry, I don\'t know that one. Would you like to try another name?')
          .reprompt('There is no entry for this name...')
          .getResponse();
      }

      return handlerInput.responseBuilder
        .speak(speechText + 'Would you like to try another name?')
	.reprompt('I hope that means something to you...')
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak('Your gender is ' + sessAttr.gender + '. ' + 'What is your name?')
	.reprompt('What is your name?')
        .getResponse();
    }
  },
};

const NameIntentHandler = {
  canHandle(handlerInput) {
    let isStarted = false;
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();

    return sessAttr.startedSkill && handlerInput.requestEnvelope.request.type === 'IntentRequest'
           && handlerInput.requestEnvelope.request.intent.name === 'NameIntent';
  },
  async handle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();
    var userNameMeans;

    if (sessAttr.name === 'default') {
      sessAttr.name = handlerInput.requestEnvelope
		      .request.intent.slots.Name
		      .value.replace(/^\w/, c => c.toUpperCase());
    }
    if (sessAttr.gender && sessAttr.gender !== 'default') {
      await searchName(URLGET + sessAttr.gender + '/' + sessAttr.name + '.htm').then(function(result) {
        userNameMeans = result;
      });
   
       if (!userNameMeans || userNameMeans === 'undefined') {
        return handlerInput.responseBuilder
          .speak('I\'m sorry, I don\'t know that one. Would you like to try another name?')
          .reprompt('There is no entry for this name...')
          .getResponse();
      }

      const speechIntro = sessAttr.name + ' means: ';
      var speechText = speechIntro + userNameMeans;
      
      return handlerInput.responseBuilder
        .speak(speechText + 'Would you like to try another name?')
	.reprompt('I hope that means something to you...')
	.getResponse();
    } 
    return handlerInput.responseBuilder
      .speak('Your name is ' + sessAttr.name + '. ' + 'What is your gender?')
      .reprompt('I don\'t know about that one...')
      .getResponse();
  },
};

const NameMeaningRecallIntentHandler = {
  canHandle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();
    
    return sessAttr.startedSkill && handlerInput.requestEnvelope.request.type === 'IntentRequest'
	   && handlerInput.requestEnvelope.request.intent.name === 'NameMeaningRecallIntent';
  },
  async handle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();
    var userNameMeans;

    if (sessAttr.name === 'default') {
      return handlerInput.responseBuilder
        .speak('What is your name?')
        .reprompt('What is your name?')
        .getResponse();
    } else if (sessAttr.gender === 'default') {
      return handlerInput.responseBuilder
        .speak('What is your gender?')
        .reprompt('I don\'t know about that one...')
        .getResponse();
    } else {
      await searchName(URLGET + sessAttr.gender + '/' + sessAttr.name + '.htm').then(function(result) {
        userNameMeans = result;
      });

      if (!userNameMeans || userNameMeans === 'undefined') {
        return handlerInput.responseBuilder
          .speak('I\'m sorry, I don\'t know that one. Would you like to try another name?')
          .reprompt('There is no entry for this name...')
          .getResponse();
      }

      const speechIntro = sessAttr.name + ' means: ';
      var speechText = speechIntro + userNameMeans;

      return handlerInput.responseBuilder
        .speak(speechText + 'Would you like to try another name?')
	.reprompt('I hope that means something to you...')
        .getResponse();
    }
  },
};

const RepromptIntentHandler = {
  canHandle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();

    return sessAttr.startedSkill && handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RepromptIntent';
  },
  handle(handlerInput) {
    const attrMan = handlerInput.attributesManager;
    const sessAttr = attrMan.getSessionAttributes();

    sessAttr.startedSkill = false;

    return handlerInput.responseBuilder
      .speak('Would you like to start over?')
      .reprompt('Would you like to start over?')
      .getResponse();
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Ask me what your name means!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
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
      .speak('Sorry, I don\'t understand. Try confirming with \'yes\', \'no\', or responding to the prompt.')
      .reprompt('Something probably went wrong. Blame the Samurai who programmed me.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    NameIntentHandler,
    GenderIntentHandler,
    NameMeaningRecallIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    RepromptIntentHandler,
    YesIntent,
    NoIntent
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
