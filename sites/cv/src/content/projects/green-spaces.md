---
layout: ../../layouts/project-layout.astro
title: GREENSPACES
description: Efficient management of urban green areas
thumbnail: /projects-thumbs/green-spaces.png
---

# GREENSPACES - Efficient management of urban green areas

The company that I work for has a product called **GREENSPACES**. It is a web platform that helps municipalities and companies to manage their green areas. The front end is built with Angular and the back end with PHP and MySQL. The product was a new version of their old product that was built with PHP and jQuery. I participated in the development of the new version of the product as a front-end developer.

## The mono-repo

The front end was developed inside a mono-repo. The choice was made because there were a couple of projects that the company maintained on the side of GreenSpaces. Those projects were a couple of Angular applications one of them with Cordova. The mono-repo was a good choice because it allowed us to share code between the projects. The mono-repo was built with [Nx](https://nx.dev/), a tool that (at the time) extended the Angular CLI to support multiple projects in the same workspace.

## A case for [Nx](https://nx.dev/)
