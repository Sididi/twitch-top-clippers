#!/usr/bin/env node
'use strict';

/* Packages */
const _ = require('lodash');
const axios = require('axios').default;

/* Constants */
const config = require('./config.json');

/* Main execution func */
(async () => {

    /* Get access token */
    const access_token = 'Bearer ' + (await axios({
        method: 'post',
        url: 'https://id.twitch.tv/oauth2/token',
        params: {
            client_id: config.client_id,
            client_secret: config.client_secret,
            grant_type: 'client_credentials'
        }
    })).data.access_token;

    /* Set a date limit (Friday 23h42) */
    const prevFriday = new Date();

    prevFriday.setDate(prevFriday.getDate() - (prevFriday.getDay() + 2) % 7);
    prevFriday.setHours(23, 42);

    /* Retrieve channel's latest clips */
    const clips = _.groupBy((await axios({
        method: 'get',
        url: 'https://api.twitch.tv/helix/clips',
        headers: {
            'Authorization': access_token,
            'Client-Id': config.client_id
        },
        params: {
            broadcaster_id: '46516676',
            started_at: prevFriday,
            first: '100'
        }
    })).data.data, 'creator_name');

    /* Computes and sorts the best clippers */
    const topClippers = _.fromPairs(_.sortBy(_.toPairs(_.mapValues(clips, clip => _.reduce(clip, (sum, el) => sum + el.view_count, 0))), 1).reverse());

    console.log(topClippers);

})();