
const fs = require('fs')
const fetch = require('node-fetch');

let jsonData = JSON.parse(fs.readFileSync('data.json', 'utf-8'))

// console.log(jsonData['data'].length)

// console.log(jsonData['data'][3]['repo'])

const accessToken = '8669050a222e536506c9c0c453fef8a1e82141bc';

const query = `
	query($author: String!, $repo: String!){
	  repositoryOwner(login: $author){
	    repository(name: $repo){
	      ref(qualifiedName: "master"){
	        target{
	          ... on Commit{
	            history(first: 20){
	              edges{
	                node{
	                  author{
	                    name
	                  }
	                }
	              }
	            }
	          }
	        }
	      },
	      stargazers{
	        totalCount
	      },
	      updatedAt,
	      forkCount,
	      pullRequests{
	        totalCount
	      }
	    }
	  }
	}
	`;

var jdata;
var i,j;
var score = 0;
var stars;
var botCheck;
var botCount;


async function gitData(){

	for(i = 0 ; i < jsonData['data'].length ; i++){
  
		score = 0;
		botCount = 0;
		const variables = {
			author : jsonData['data'][i]['author'],
			repo : jsonData['data'][i]['repo']
		}
		await fetch('https://api.github.com/graphql', {
		  method: 'POST',
		  body: JSON.stringify({query, variables}),
		  headers: {
		    'Authorization': `Bearer ${accessToken}`,
		    'Content-Type': 'application/json',
		  },

		}).then(res => 
			res.text()
			)
		  .then(body => {
		  	jdata = JSON.parse(body);
		  	// console.log(jdata)
		  	stars = jdata["data"]["repositoryOwner"]["repository"]["stargazers"]["totalCount"];
		  	// console.log(stars)
		  	score = score + starsResult(stars)
		  	// console.log(score)
		  	score = score + timeResult(jdata["data"]["repositoryOwner"]["repository"]["updatedAt"])
		  	botCheck = jdata["data"]["repositoryOwner"]["repository"]["ref"]["target"]["history"]["edges"]
		  	// console.log(score)
		  	for(j = 0 ; j < 20 ; j++){
		  		if((botCheck[j]["node"]["author"]["name"]).match(/bot/i)){
		  			botCount++;
		  			// console.log(botCheck[j]["node"]["author"]["name"])
		  		}
		  	}
		  	score = score + botResult(botCount)
		  	// console.log(botCount)
		  	// console.log(t + " " + score)
		  	console.log("Repository " + jsonData['data'][i]['repo'] + " scores : " + score + " points")

		  })
		  .catch(error => 
		  	console.error(error)
		  );
	}
}

gitData()


function botResult(botCount){
	if(botCount == 0){
		return 40
	}
	else if(botCount >=1 && botCount < 4){
		return 35;
	}
	else if(botCount >=4 && botCount < 6){
		return 30;
	}
	else if(botCount >=6 && botCount < 8){
		return 25;
	}
	else if(botCount >=8 && botCount < 10){
		return 20;
	}
	else if(botCount >=10 && botCount < 12){
		return 15;
	}
	else if(botCount >=12 && botCount < 14){
		return 10;
	}
	else{
		return 0;
	}
}

function timeResult(date){
	var dateobj = new Date(date);
	var currdate = new Date();
	var diff;
	// console.log(currdate.toLocaleDateString());
	// console.log(dateobj.toTimeString())
	diff = currdate - dateobj;
	diff = Math.floor(diff/60e3);
	if(diff <= 1440){
		return 5;
	}
	else if(diff > 1440 && diff <= 4320){
		return 3;
	}
	else if(diff > 4320 && diff <= 10080){
		return 2;
	}
	else if(diff > 10080 && diff <= 20160){
		return 1;
	}
	else{
		return 0;
	}
}

function starsResult(stars){
	if(stars >= 12000){
		return 30;
	}
	else if(stars >= 10000 && stars < 12000){
		return 25;
	}
	else if(stars >= 9000 && stars < 10000){
		return 22;
	}
	else if(stars >= 8000 && stars < 9000){
		return 19;
	}
	else if(stars >= 6000 && stars < 8000){
		return 15;
	}
	else if(stars >= 4000 && stars < 6000){
		return 13;
	}
	else if(stars >= 3000 && stars < 4000){
		return 10;
	}
	else if(stars >= 1000 && stars < 3000){
		return 7;
	}
	else if(stars >= 500 && stars < 1000){
		return 5;
	}
	else {
		return 1;
	}
}