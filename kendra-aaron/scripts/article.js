'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// This method uses the contextual 'this,' so an arrow function would not be a good choice.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // Line 25 is a ternary statement. If this.publishedOn has a value, then this.publishStatus becomes 'published 'n' days ago', otherwise it becomes '(draft)'. This ternary can also be represented with an If(condition){expression1}. else{expression2}.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// This function is called inside of Article.fetchAll if there's a value for the 'rawData' key in localStorage. rawData is now a string of JSON.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.rawData) {
    $.ajax({
      url: './data/hackerIpsum.json',
      method: 'HEAD',
      success: (data, message, response) => {
        //if etag matches, load from localStorage, else make GET request for updated content
        let etag = response.getResponseHeader('eTag');
        if(etag === localStorage.eTag){
          Article.loadAll(JSON.parse(localStorage.rawData));
        } else{
          $.ajax({
            url: './data/hackerIpsum.json',
            method: 'GET',
            success: (data, message, response) => {
              Article.loadAll(data);
              //Store eTag and data in localStorage
              let etag = response.getResponseHeader('eTag');
              localStorage.setItem('eTag', etag);
              localStorage.setItem('rawData', JSON.stringify(data));
            }
          });
        }
      }
    })
  } else {
    // We first make a request for the data with a success function that first calls Article.loadAll on
    // the retrieved data. Then, after loading the data, it saves it as stringified JSON to localStorage.
    $.ajax({
      url: './data/hackerIpsum.json',
      method: 'GET',
      success: (data, message, response) => {
        Article.loadAll(data);
        //Store eTag and data in localStorage
        let etag = response.getResponseHeader('eTag');
        localStorage.setItem('eTag', etag);
        localStorage.setItem('rawData', JSON.stringify(data));
      }
    });
  }
}
