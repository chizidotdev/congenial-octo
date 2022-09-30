require('dotenv').config();
const twit = require('./twit');
const fs = require('fs');
const path = require('path');
const paramsPath = path.join(__dirname, 'params.json');

function writeParams(params) {
  console.log('Writing params to file ...', params);
  fs.writeFileSync(paramsPath, JSON.stringify(params));
}

function readParams() {
  console.log('Reading params from file ...');
  const params = fs.readFileSync(paramsPath);
  return JSON.parse(params.toString());
}

function getTweets(since_id) {
  return new Promise((resolve, reject) => {
    let params = {
      q: '#100DaysOfCode',
      count: 10,
    };
    if (since_id) {
      params.since_id = since_id;
    }
    console.log('Getting tweets ...', params);

    twit.get('search/tweets', params, (err, data) => {
      if (err) {
        return reject(err);
      }

      console.log(data);
      return resolve(data);
    });
  });
}

function postRetweet() {
  return new Promise((resolve, reject) => {
    let params = { id };

    twit.post('statuses/retweet/:id', params, (err, data) => {
      if (err) {
        return reject(err);
      }

      console.log(data);
      return resolve(data);
    });
  });
}

async function main() {
  try {
    let params = readParams();
    const data = await getTweets(params.since_id);
    const tweets = data.statuses;

    console.log('Tweets: ', tweets);

    for await (const tweet of tweets) {
      const id = tweet.id_str;
      try {
        const retweet = await postRetweet(id);
        console.log('Successful retweet: ', id);
      } catch (error) {
        console.log('Unsuccessful retweet ', id);
      }
      params.since_id = id;
    }
    writeParams(params);
  } catch (error) {
    console.log(error);
  }
}

console.log('Starting bot...');

setInterval(main, 1000 * 60 * 60 * 6);
