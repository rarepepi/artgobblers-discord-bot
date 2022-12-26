<p align="center">
  <img src="https://i.imgur.com/MVEC74R.png" width="200" alt="Logo" />
</p>

  <p align="center"> Next.js microservice that sends a message through a Discord webhook whenever there is a Gobble or Glam event.</p>

## Description

There is a cron job that runs every couple of minutes to check the last 1000 txns of the Art Gobblers Smart Contracts and see if any ArtGobbled events occured. If it doesn't have that txn hash stored it will send a message to discord through a webhook.

Glamination works through querying the backend api of the Art Gobblers website, since the Glam is off-chain and gas-less.

## Installation

- First you must create a .env file in order to use the Etherscan and Discord APIs. You can find an example in _examples/example.env_ just rename the file to _.env_ and fill in the blanks.

```bash
$ yarn
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## License

This project is [MIT licensed](LICENSE).
