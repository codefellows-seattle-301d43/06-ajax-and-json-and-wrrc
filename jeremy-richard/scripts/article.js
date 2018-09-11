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
// The contextual this is used which is not able to be used with arrow functions. With arrow functions, this applies to the window object and not the object that owns the method for regular functions.

Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // It is a ternary operator that is acting as an 'if' conditional statement, so if this.publishedOn is true then the code following the '?' will run, else the string 'draft' will be returned.

  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// THe function is called by Article.fetchAll below. rawData is the ajax retrieved JSON information that is stored in local storage. Previously, rawData was included in a JS file.

Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  //It is checking for rawData saved in local storage, if it exists then the Article.loadAll function is called. Else, rawData will be loaded from a remote source.
  if (localStorage.rawData) {

    Article.loadAll(JSON.parse(localStorage.rawData));
    console.log('loaded from local storage');

  } else {
    $.ajax({
      url: '../data/hackerIpsum.json',
      method: 'GET',
      success: (data) => {
        console.log('data retrieved');
        localStorage.setItem('rawData', JSON.stringify(data));
        Article.all = JSON.stringify(data);
      },
    });

  }

}
//COMMENT: We used the console log and our knowledge of functions to determine the sequence of code execution. Then we verfied in the local storage to ensure proper functionality.

Article.fetchAll();




