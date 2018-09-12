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
// This method is not written as an arrow function because it uses this and an arrow function would not bind the contextual this.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // This is a ternary operator, if/else.
  // if(this.publishedOn){
  //   `published ${this.daysAgo} days ago`
  // } else {
  //   '(draft)'
  // }
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// This function is called in fetchAll. 'rawData' was previously an array of objects defined in a separate JS file. It was a string that lived in localStorage, but now it's back to being a JS object because we have parsed the string in the .fetchAll method. In previous labs we loaded the articles from a function call at the end of the index page.
Article.loadAll = articleData => {

  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?

  // We check if the data is in local storage. If it is not, we load it from the remote, and set it into local storage. The next time the page is loaded is loads from local storage.
  if (localStorage.rawData) {
    Article.loadAll(JSON.parse(localStorage.rawData));
  } else {
    $.ajax({
      method: 'GET',
      url: '../data/hackerIpsum.json',
      success: (data) => {
        Article.loadAll(data);
        articleView.initIndexPage();
        localStorage.setItem('rawData', JSON.stringify(data));
      },
      error: (xhr) => console.log(xhr.responseText)
    });
  }
}