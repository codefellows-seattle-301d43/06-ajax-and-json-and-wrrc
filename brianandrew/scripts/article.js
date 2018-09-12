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
// We could not write this as an arrow function because an arrow function removes our ability to properly use the contextual this.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // This statement checks to see if the statement is an if/else; if true, then the text after the ? is executed, else the statement ater the : is executed.  In this case if the article is already published a published on date will be insterted, otherwise it'll open up the draft page.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// The loadAll function is called with in the fetchAll function as the fetchAll function is checking to see if the local storage contains rawData. During previous labs the rawData was not containted as a JSON string.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? This is checking to see if the remote server data has already been stored to local storage, if true then data is pulled from the local storage, else it's pulled from the remote server.
  //Where was the rawData set to local storage? We set rawData in the else statement w/in the success function.
  if (localStorage.rawData) {
    Article.loadAll(JSON.parse(rawData));
    articleView.initIndexPage();
    console.log('local storage used');
  } else {
    $.ajax({
      url: 'data/hackerIpsum.json',
      method: 'GET',
      success: (data) => {
        console.log('response received');
        localStorage.setItem('rawData', JSON.stringify(data));
        Article.loadAll(data);
        articleView.initIndexPage();
      }
    });
  }
}


