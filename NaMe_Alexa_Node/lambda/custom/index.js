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
  return res[1];
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
      .reprompt(speechText)
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
    const attrMan = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessAttr = attrMan.getSessionAttributes();

    sessAttr.name         = 'default';
    sessAttr.gender       = 'default';
    sessAttr.startedSkill = true;

    //attrMan.setSessionAttributes(sessAttr);

    console.log("YES INTENT SESSATTR === ", sessAttr);

    return responseBuilder
      .speak('Okay, tell me your name.')
      .reprompt()
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
    const sessionAttributes = await attributesManager.getSessionAttributes();

    sessionAttributes.startedSkill = false;
//    attributesManager.setPersistentAttributes(sessionAttributes);

    //await attributesManager.savePersistentAttributes();

    return responseBuilder.speak('Ok, see you next time!').getResponse();
  },
};

/*
 *
 * END SOURCE
 *
 */

/*const AnswerIntentHandler = {
  canHandle(handlerInput) {
    let stateful = false;
    const attrMan = handlerInput.attributeManager;
    const sessAttr = attrMan.getSessionAttributes();
    console.log(sessAttr);

    if (sessAttr.startedSkill &&
        sessAttr.startedSkill == true &&
        sessAttr.name &&
	sessAttr.gender) {
	stateful = true;
    }
    return stateful && handlerInput.requestEnvelope.request.type == 'IntentRequest' &&
           handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent';

  },
  handle(handlerInput) {
    const attrMan = handlerInput.attributeManager;
    const sessAttr = attrMan.getSessionAttributes();

    this.emit(':elicitSlot', 'Name', 'What is your name?');
    this.emit(':elicitSlot', 'Gender', 'What is your gender?');
    
    sessAttr.name = this.event.request.intent.slots.Name.value;
    sessAttr.gender = this.event.request.intent.slots.Gender.value;
  },
};*/

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

    console.log('GENDER INTENT HANDLER ISSUES === ', handlerInput.requestEnvelope.request.intent.slots);

    if (sessAttr.gender === 'default') {
      sessAttr.gender = handlerInput.requestEnvelope
		        .request.intent.slots.Gender
		        .value.replace(/^\w/, c => c.toUpperCase());
      console.log('DEBUG 2 SESSATTR === ', sessAttr);
    }
  //  attrMan.setSessionAttributes(sessAttr);

    console.log('DEBUGGING GENDER INTENT SESSION ATTR === ', sessAttr);

    if (sessAttr.name && sessAttr.name !== 'default') {
      console.log('GENDER-ASS NAME MEANING === ', URLGET + sessAttr.gender + '/' + sessAttr.name + '.htm');
      await searchName(URLGET + sessAttr.gender + '/' + sessAttr.name + '.htm').then(function(result) {
        userNameMeans = result;
      });

      const speechIntro = sessAttr.name + ' means: ';
      var speechText = speechIntro + userNameMeans;

      return handlerInput.responseBuilder
        .speak(speechText)
	.reprompt('I hope that means something to you...')
        .getResponse();
    } else {
      console.log('DEBUG 3 SESSATTR === ', sessAttr);
      return handlerInput.responseBuilder
        .speak('What is your name?')
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

    console.log('NAME INTENT HANDLER ISSUES === ', handlerInput.requestEnvelope.request.intent.slots);
    console.log('DEBUGGING NAME INTENT SESSION ATTR === ', sessAttr);

    console.log('MAKING SURE SESSION VARS ARE DEFAULT === ', sessAttr);

    if (sessAttr.name === 'default') {
      sessAttr.name = handlerInput.requestEnvelope
		      .request.intent.slots.Name
		      .value.replace(/^\w/, c => c.toUpperCase());
      console.log('DEBUG 0 SESSATTR === ', sessAttr);
    }

    if (sessAttr.gender && sessAttr.gender !== 'default') {
      console.log('NAME-ASS NAME MEANING === ', URLGET + sessAttr.gender + '/' + sessAttr.name + '.htm');
      await searchName(URLGET + sessAttr.gender + '/' + sessAttr.name + '.htm').then(function(result) {
        userNameMeans = result;
      });
      
      const speechIntro = sessAttr.name + ' means: ';
      var speechText = speechIntro + userNameMeans;
      
      return handlerInput.responseBuilder
        .speak(speechText)
	.reprompt('I hope that means something to you...')
	.getResponse();
    } 
    console.log('DEBUG 1 SESSATTR === ', sessAttr);
    console.log('NEEDS GENDER');
    return handlerInput.responseBuilder
      .speak('What is your gender?')
      .reprompt('What is your gender?')
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

    console.log("NAME RECALL === ", sessAttr);

    if (sessAttr.name === 'default') {
      return handlerInput.responseBuilder
        .speak('What is your name?')
        .reprompt('What is your name?')
        .getResponse();
    } else if (sessAttr.gender === 'default') {
      return handlerInput.responseBuilder
        .speak('What is your gender?')
        .reprompt('What is your gender?')
        .getResponse();
    } else {
      await searchName(URLGET + sessAttr.gender + '/' + sessAttr.name + '.htm').then(function(result) {
        userNameMeans = result;
      });

      const speechIntro = sessAttr.name + ' means: ';
      var speechText = speechIntro + userNameMeans;

      return handlerInput.responseBuilder
        .speak(speechText)
	.reprompt('I hope that means something to you...')
        .getResponse();
    }
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
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
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
    YesIntent,
    NoIntent
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
