# rescuetime-summary

Print rescuetime summary of the previous weekday in avochoc format with markdown formatting.

### Quickstart

1. Create rescuetime API key at https://www.rescuetime.com/anapi/manage
2. Install via npm

```
npm i -g https://github.com/neillatavochoc/rescuetime-summary.git
```

3. Run using `rescuetime-summary --key [your api key]`

### Options

| Option          | Description                                                                                   | Default                          |
| --------------- | --------------------------------------------------------------------------------------------  | -------------------------------- |
| -k, --key       | Rescuetime api key.                                                                           | Value of env RESCUE_TIME_API_KEY |
| -d, --date      | Date for summary in [moment recognized format](https://momentjs.com/docs/#/parsing/string/).  | Previous weekday                 |
| -c, --clipboard | Copy text directly to clipboard. [experimental]                                               | `false`                          |
| --debug         | Print out debug information.                                                                  | `false`                          |


### Environment variables

The api key can be set using the `RESCUE_TIME_API_KEY` environment variable.

Add`export RESCUE_TIME_API_KEY=[your api key]` to ~/.zshrc or ~/.bashrc (Windows: add to environment variables), restart terminal and run `rescuetime-summary`.

### Usage examples:

```
  rescuetime-summary
```

```
  rescuetime-summary --date '2021-01-01'
```

```
  rescuetime-summary --key [your api key] --date '2021-01-01'
```

Run `rescuetime-summary --help` for more info.

#### Output example:
```sh
Yesterday I logged *10h 22m*
Breakdown:
*76%* Software Development
*15%* Communication And Scheduling
*6%* Reference And Learning
*2%* News
*1%* Uncategorized
*1%* Utilities
Productivity Pulse: *91%*
```
Once the text has been pasted into Slack, hit `CTRL`+`SHIFT`+`F` to apply formatting.
