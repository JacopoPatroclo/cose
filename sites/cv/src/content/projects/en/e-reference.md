---
layout: ../../../layouts/project-layout.astro
title: E-Reference Book Platform
description: Web portal developed for Way to manage the different configurations for their products
thumbnail: /projects-thumbs/e-reference.png
---

# E-Reference Book Platform

E-Reference Book is a web portal developed for a company called Way Srl (Somfy Group). The company is a European leader in windows automation. The platform is used by the sales team to manage the different configurations for their products. The platform is also used by the customers to access the documentation of the products they bought. The platform is built with React for the front end and Node.js with Nest.js for the back end those parts use GraphQL to communicate. The choice for the database is PostgreSQL.

## The requirements

Before this platform, the client managed all the different types of configurations using a series of Microsoft tools like Excel and OneDrive. The issues with that approach were multiple: it was hard to enforce rules during the customization process. Moreover, the sales team had to manually create the documentation for the customers. The documentation was also not easily accessible to the customers. The request was to create a platform that could manage all the different configurations and that could generate a PDF document that summarized the order and the configurations chosen by the customer.

## The challenges

The challenges that we faced during the technical analysis of this project were identified in a series of points:

- The platform had to be accessible to the customers and to the sales team, so we had to create a system of authentication and authorization that could be easily managed by the client inside the platform itself. The platform would also require to support only authentication using Microsoft Active Directory as a way to filter which users can access the platform. Only a subset of the users present in the Active Directory could access the platform, so we had to find a way to filter the users.
- The platform should generate a PDF document that summarizes the order and the configurations chosen by the customer. At the time of the analysis, we didn't have a clear idea of how the PDF document should have looked like.
- The type of data that the application had to manage was mostly flat with fewer tables with a lot of columns but still a good number of relations so a no SQL database was not an option.
- The platform had to be able to manage a considerable amount of assets like images and PDF documents. With different access levels for the different users. Also, other assets were needed to be publicly accessible.
- The client had already a dataset with all the information about the products and the configurations. The dataset was in a series of Excel files and the client wanted to use that dataset to populate the database of the application.

## The solutions

As I approached the architectural decisions I had to keep in mind that the whole system had to be flexible to changes in the workflows, mainly on the configuration side. We had to take into account that a series of admins are going to need a way to edit the configuration roles and options. Now I'm going to describe the solutions that I choose for the different challenges that I described in the previous section.

For the first problem, we choose to implement an authentication strategy using JWT tokens. The tokens were stored in an HTTP-only encrypted cookie. The tokens were generated only after the user had completed the Oauth2 process against the Active Directory and were present on the user database table of the application. This was needed because not all the users contained in that active directory could access the platform. The match between the user and the active directory was done by using the UID provided by the Active Directory during the OAuth2 flow that has been saved on the corresponding user record. For this reason, we choose to roll out a custom authentication implementation without the use of a library (passport.js or similar). The user role information was stored in a specific table related to the user table. In conclusion: Implementing a custom passport strategy would be very similar to implementing everything from scratch, so that option was not considered at all. We tried to avoid using special labels on the Active Directory to identify the users who could access the platform. A single source of truth is preferable for this kind of implementation. Moreover, our company didn't have access to the Active Directory so we couldn't make sure that the metadata for the users were correct over time. Some sysadmin somewhere could break out authentication or access level policies without us or him knowing it. **Your team has to make sure that the system that you are building has a clear separation of concerns between systems**, otherwise, a lot of "hard to debug" issues will pile on.

The second problem was tackled by using a separate service that was responsible for generating the PDF documents. The service was written in Typescript and used Puppeteer to generate the actual document. Puppeteer let us use the same UI components that we had developed for the main web application. The service was also responsible for uploading the generated PDF to the s3 bucket used by the application. The fact that all the pieces of the platform lived inside the same mono-repo helped us to share easily the upload logic to s3 between the main API layer and this print microservice. The communication between these two components was done by using the pub/sub capabilities of Redis (_that we used already as an application cache storage_). Using Puppeteer to generate the PDF documents from a web page rendered by a React SPA was a tricky task. We had to use a series of hacks to make it work. The main issue was the fact that the data to populate the web page was fetched asynchronously. We had to use a notification system to let us know to Puppeteer when the page was ready to be printed. In short, we fetch all the print data from the API using a single React hook, in this way, we could emit the event on the window when the data were ready. The event was then captured by Puppeteer and the PDF was generated. The choice to use a separate service to generate the PDF was mainly for performance reasons, we did not want to overload the main API layer while the PDF was being generated.

The third problem was solved by using GraphQL. The main selling point was the fact that the schema of the application was not designed by us directly but was kind of imposed by the client's already existing structure. This situation didn't let us develop a structure that was optimized for how the UI application required the data. Using GraphQL we solved the issue of sending too much unused data to the client. I personally do not like GraphQL for reasons that I'm not going to discuss here. But I think that in this case, it was the right choice. **The right tool for the right job**.

The fourth challenge was solved by using an object storage service like s3. The service was used to store all the assets of the application. The assets were uploaded to s3 by the print service and by the main API layer. To solve the issue of the different access levels we could let the main API layer be a proxy between the client and the s3 bucket. In this way, we could enforce the access policies. Of course, this solution was not optimal for serving all the assets due to the unnecessary load on the main API layer. Moreover, a solution like this could not be used with a CDN. So we choose to strike a balance between this solution and direct access to the s3 bucket through a CDN. For all the public assets the API layer provided a link to the CDN, for all the private assets the API layer was a proxy between the client and the s3 bucket.

The last challenge was solved using a metaprogramming approach. Since we used TypeOrm as a way to describe the structure of the database, I've developed a series of property decorators that were used to bind the structure of the Excel files onto the database columns and tables. Using this approach we could write an import script easily. All the Excel files were condensed into a single one with a series of sheets. Each sheet was a table in the database. The script was responsible for reading the Excel file and for populating the database with the data. The script was also responsible for creating the relations between tables, the relations were described by TypeOrm, but given the fact that we decorate every table with a decorator that described which Excel sheet was bound to, we could use that information to create the relations and solve all the import ordering issues. Over time the structure of the Excel file changed as well as the structure of the database, but the import script was never touched. The API of this internal library was something like this:

```typescript
@Table('some_table')
@ExcelSheet('some_sheet')
class SomeTable {
  // We let the user defined the column name, by default from the same sheet
  // You can also define a parse function to parse the value.
  @ExcelColumn('some_column', { parse: (value) => parseInt(value) })
  @Column()
  someColumn: number;

  // You can have a column that is not present in the Excel file
  @Column()
  someColumn: string;

  // You can declare a relationship with another table and express for which column
  // in the excel file the relation is defined, of curse if is a one to many relation
  // this could be resolved into an list of objects extracted by the Excel file, if the relation was
  // * to one then the relation could be resolved into a single object
  // this behavior was handled by the import script importing all the occurrences if the relation was
  // one to many and only the first occurrence if the relation was * to one
  @ExcelRelatedColumn({ excelIdentificationColumn: 'some_other_sheet_column' })
  @OneToMany(() => SomeRelatedTable, (someRelatedTable) => someRelatedTable.someTable)
  someRelatedTable: SomeRelatedTable;
}

@Table('some_other_table')
@ExcelSheet('some_other_sheet')
class SomeOtherTable {
  @ExcelColumn('some_other_sheet_column')
  @Column()
  someColumn: string;

  @ManyToOne(() => SomeTable, (someTable) => someTable.someRelatedTable)
  someTable: SomeTable;
}
```

## My thoughts

First I want to address the fact that sometimes the best solution isn't the right one. Sometimes time and money constraints are what you are really up against. The choice I made around the way of serving the static assets was not the most correct, we should have used pre-signed URLs. But the implementation of that solution would have taken too much time and money. So we chose to go with a simpler solution that was not the best one. I think that this is a good example of how you should always keep in mind the constraints that you are working with. **Sometimes the best solution is not the right one**.

Second I want to emphasize the importance and the value of a good abstraction. The import script that I described in the previous section is, in my opinion, a good example. Software abstraction should be specific and self-contained. The API should be simple and yet powerful. An abstraction can only be qualified after some time. If its implementation stays the same while the project evolves and the requirement changes; that is a sign of a good abstraction. **Too often in software development, we try to abstract complexity away and accidentally create more of it along the way**
