# RED ANGPOW API SERVER

## Installation

```
$ npm i
```

### Setup GCP CLI

1. Install [gcp cli](https://cloud.google.com/sdk)

2. Select project

## Development

To start development

```
$ npm run dev
```

## Production (Local)

To start production environment locally

```
$ npm run start
```

## Deployment (Staging & Production)

Step-by-step instruction on how to push the latest codebase up to the staging environment:

### Prerequisites

> For more information, you can refer to the official documentation from Google [here](https://cloud.google.com/appengine/docs/standard/nodejs/building-app).

> Make sure there are separate App Engine projects for `staging` and `production`. Do not use 1 project.

1. Install the [GCP SDK](https://cloud.google.com/sdk/docs) to your local machine.
2. Sign in with `Red Angpow`'s credentials.
3. Select a project. If there is no `staging` project under App Engine, create one. Refer to Google's official documentation linked [here](https://cloud.google.com/appengine/docs/standard/nodejs/building-app)
4. Please read [Environment Variables](#environment-variables) > Before deployment to setup the env variables. This is IMPORTANT.
5. Run `gcloud app deploy` to deploy to App Engine.
6. Select the project and all, at the end, you will receive a random endpoint to the API Server.
7. To setup a custom domain, go to the App Engine console > Settings. Here you may add a custom domain with a subdomain.

## Environment Variables

### Local Development

Place `config.env` on root of directory

```
DATABASE=<...>
DATABASE_PASSWORD=<...>
PORT=<...>
```

### Before deployment (Staging/Production)

Create a file called `env_variables.yaml` in root directory
Example

```
// ./env_variables.yaml
env_variables:
  DATABASE: ....
  DATABASE_PASSWORD: ....
  PORT: 8080 // default port for app engine
```

Check `app.yaml` and make sure the file is linked.

## Issues

-
