require('dotenv').config();
const axios = require('axios');
const {writeFile} = require('fs');
const path = require('path');

const {API_KEY, SLACK_WH_URL} = process.env;
const lang = 'fr'
const baseUrl = `https://imdb-api.com/${lang}/API`;

const IMDB_API_ENDPOINTS = {
  searchMovieByExpression: 'SearchMovie',
  advancedSearch: 'AdvancedSearch',
  IMDbList: 'IMDbList',
};

/**
 * Searching movies by an expression
 * @param {string} expression
 * @returns {Array} movies objects
 */
async function GetMoviesByExpression(expression){
  const results = await axios.get(`${baseUrl}/${IMDB_API_ENDPOINTS.searchMovieByExpression}/${API_KEY}/${expression}`);
  movies = results.data.results;
  console.log(movies);
  return movies;
}

/**
 * Searching movies with 
 * @param {Object} searchConfig - content all search items to be parsed into queryString
 * @returns {Array} movie objects
 */
async function GetMoviesByAdvancedSearch(searchConfig){

  let queryString = ``;
  for (key of Object.keys(searchConfig)) {
    queryString += `${key}=${searchConfig[key]}&` 
  };
  queryString = queryString.slice(0, -1);
  const results = await axios.get(`${baseUrl}/${IMDB_API_ENDPOINTS.advancedSearch}/${API_KEY}?${queryString}`);
  movies = results.data.results;
  console.log(movies);
  return movies;
}

/**
 * Returns all movies in the searched list
 * @param {string} IMDblistId
 * @returns {Array} movie objects
 */
async function GetMoviesFromListId(IMDblistId){
  const results = await axios.get(`${baseUrl}/${IMDB_API_ENDPOINTS.IMDbList}/${API_KEY}/${IMDblistId}`);
  return results.data.items;
}

/**
 * Append to listId.json file all unlisted movies, adding an id, the IMDb id and Title
 * @param {string} IMDblistId
 * @returns {JSON File} movie list object upadated
 */
async function UpdateMovieListFromListId(IMDblistId){

  const filePath = path.resolve(__dirname, './movie_lists')
  const fileName = IMDblistId + '.json';

  const movies = await GetMoviesFromListId(IMDblistId);
  console.log(movies);
  const fileContent = JSON.stringify(movies);
  console.log(fileContent);
  writeFile(filePath + '/' + fileName, fileContent, (err)=>{console.log(err)});
}

const movies = require('./movie_lists/ls560101464.json');

async function postMessageOnSlack (movies){
  const day0 = new Date(2022,03,14,16).getTime();
  const today = new Date().getTime();
  const index = Math.round((today-day0)/(24*3600*1000));
  axios.post(SLACK_WH_URL,
    {
      text: movies[index].fullTitle,
      blocks : [
        {
          type:"image",
          image_url: movies[index].image,
          alt_text : movies[index].fullTitle,
          title : {
            text : movies[index].fullTitle,
            type: "plain_text"
          }
        },
        {
          type:"section",
          text:{
              text: movies[index].fullTitle,
              type: "plain_text"
          },
        }
      ],
    },
{
    headers:{"Content-Type":"application/json"}
});
}

// Tests ---------------------------------------

// GetMoviesByExpression('Inception 2010');

// const mySearchConfig = {
//   title: "Inception",
//   title_type: "feature",
//   release_date: "2010-01-01,2010-12-31",
//   genres: "action",
//   countries: "us",
//   languages: "en",
// }

// GetMoviesByAdvancedSearch(mySearchConfig2);

// 1 - Ajouter la liste en JSON
// UpdateMovieListFromListId('ls560101464');

//2 - Post sur slack

postMessageOnSlack(movies);