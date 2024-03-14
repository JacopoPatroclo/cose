---
layout: ../../layouts/project-layout.astro
title: Global Agency Rates Database tool for Observatory International
description: A web platform for accessing and comparing agencies from the Observatory International database
thumbnail: /projects-thumbs/gard.png
---

# Global Agency Rates Database tool for Observatory International

Observatory International is a global management consultancy dedicated to helping companies and organizations get more value from their relationships with marketing and communications agencies. Observatory International has a database of agencies that they use to help their clients find the right agency for their needs, this is done through the use of a tool called **GARD** or Global Agency Rates Database. You can find more information about the product on the [Observatory International website](https://www.observatoryinternational.com/agency-search-onboarding/).

## The challenge

The main request was the rewrite of an existing **GARD** tool that was built on top of Node.js with Express.js and Handlebars for the rendering section and the Node driver for MongoDB for the interaction with the database. The code was messy and utilized a series of Python scripts invoked by the exec Node API, to make the analysis calculations. So to develop and deploy the project you needed to have Python, Node, and all the relative dependencies installed. The code was also not very well structured and the project was not very maintainable. **The project overall had received little love over the years. It was a mess.**

## The solution

We approached the problem by first removing the need for Python to be present and to do that we needed to rewrite the analysis logic in Typescript. First, we took a series of inputs and output from the old script creating a suite of unit tests. Those inputs and outputs were not easy to identify because the Python code has access to the same database that the application used. We had to reverse-engineer all the data-retrieving sections of the code first. Once we had the unit tests in place we started to rewrite the logic in typescript with the security of a well-documented suite of test cases that used actual production data.

After having resolved the issue of the calculation scripts which was the most thorny, we dedicated ourselves to rewriting all the use cases of the product. To do that I choose a more modern approach to develop the product. We separated the business logic of the application from the UI, developing a REST API with Nest.js and a front end with React. This approach was chosen due to the uncertainty of a future expansion of the product with the need to provide some information to other websites and applications.

## My thoughts

This was a perfect example to show how good unit testing could be. This makes me realize when to use unit tests and when not. Unit tests are only good for _black boxes_ where you know the input and the output but you don't know how the logic works. **My hot take** is that you do not need unit tests as much, they are only good for this kind of situation. In my experience **when I design software I'm not 100% sure about which input and output my functions will have**. With this kind of uncertainty unit tests make you slower not faster. **It makes sense to do unit test-driven development only when you have a suite of tests that makes you more productive and not the other way around.**
