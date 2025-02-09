To create a basic controller, we use classes and decorators. Decorators link classes with the necessary metadata, allowing Nest to create a routing map that connects requests to their corresponding controllers.

DTO (Data Transfer Object) schema. A DTO is an object that specifies how data should be sent over the network. define the DTO schema using TypeScript interfaces or simple classes.

Our ValidationPipe can filter out properties that should not be received by the method handler. In this case, we can whitelist the acceptable properties, and any property not included in the whitelist is automatically stripped from the resulting object

Controllers must always be part of a module,

Providers are a core concept in Nest. Many of the basic Nest classes, such as services, repositories, factories, and helpers, can be treated as providers. The key idea behind a provider is that it can be injected as a dependency, allowing objects to form various relationships with each other

Since Nest enables you to design and organize dependencies in an object-oriented manner, we strongly recommend following the SOLID principles.

This service will handle data storage and retrieval
