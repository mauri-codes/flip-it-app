# Flip it App

Flip it app is a flashcards application

## Frontend

There is a frontend version that makes use of this project. You can find it [here](https://github.com/mauri1789/flip-it-app-web).


## Deployment

You'll need to set up your credentials with aws-cli and set the values for the deployment in `deployment.sh`

Run `npm run deploy` to create the API gateway, custom Domain Name, lambda functions and dynamo table needed for the backend of Flip it app.

Run `npm run delete` to delete the stack created with deploy command

![aws_diagram](https://user-images.githubusercontent.com/16513413/67049886-466a1a80-f105-11e9-968e-d3091036e1d1.png)
