/* eslint-disable  func-names */
/* eslint-disable  no-console */

const sys = require('util');
const request = require('request');
const Alexa = require('ask-sdk-core');
const htmlparser = require('htmlparser');

const URLGET = 'https://www.kabalarians.com/name-meanings/names/';

const parser = require('himalaya');

//*[@id="headerOL"]

function findValue(obj, value) {
  /*if key in obj: return obj[key]
    for k, v in obj.items():
        if isinstance(v,dict):
            item = _finditem(v, key)
            if item is not None:
                return item*/
  if (!value) {
    return null;
  }
  //console.log(value);
  for (key in obj) {
//    console.log('KEY === ', key, ", VALUE === ", obj);
    if (obj['attributes'] && obj['attributes'][0] && obj['attributes'][0]['value'] && obj['tagName'] == 'div') {    
      if (obj['attributes'][0]['value'] == value) {
        console.log('BIG === ', obj);//, key, value);
	return obj['children'];
      }
    } else if (obj[key] !== null && obj[key] instanceof Object) {
      findValue(obj[key], value);
    }
  }
  return null;
}

function parseReq(obj) {
//  console.log(obj);
//  console.log('VALUE FOUND === ', findValue(obj, "headerOL"));
}

function reqGet(url) {
  //console.log(url);
  request(url, function (error, response, body) {
//    console.log(body);
    var raw = body;
    var cheerio = require('cheerio');
    $ = cheerio.load(raw);
    //console.log($);
    $('#headerOL li').each(function() {
      console.log($(this).text());
    });
    //const html = fs.readFileSync(raw, {encoding: 'utf8'});
    //const json = parser.parse(raw);
//    console.log('👉', json);
    /*var handler = new htmlparser.DefaultHandler;
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(raw);
    var str = sys.inspect(handler.dom, false, null);*/
    //return parseReq(json);
  });
}

reqGet(URLGET + 'female/' + 'Alexa.htm');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechIntro = 'Welcome to Name Analysis. Everyone has meaning behind their names. For instance, Alexa means this.'
    const speechExample = reqGet(URLGET + 'female/' + 'Alexa.htm');//selenium;
    const speechCap = 'Please tell me your first name…';

    var speechText = speechIntro + speechExample + speechCap;

//    var speechQuery

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(speechText)
      .getResponse();
  },
};

const NameMeaningHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'NameMeaningIntent';
  },
  handle(handlerInput) {
    this.attributes.name = 'default';//getname;
    this.attributes.gender = 'default';//getgender

    var speechQuery = getReq(	URLGET
    				+this.attributes.gender + '/'
				+ this.attributes.name + '.htm');/*perform GET
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
    NameMeaningHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
