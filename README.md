# rescuetime-summary

### Quickstart

1. Create rescuetime API key at https://www.rescuetime.com/anapi/manage
2. Install via npm  
```
npm i -g https://github.com/neillatavochoc/rescuetime-summary.git
```
3. Run using `rescuetime-summary --key [your api key]`

### Options

| Option    | Description                                                                                  | Default                           |
|--         |--                                                                                            | --                                |
|-k, --key  | Rescuetime api key.                                                                          | Value of env RESCUE_TIME_API_KEY  |
|-d, --date | Date for summary in [moment recognized format](https://momentjs.com/docs/#/parsing/string/). | Previous weekday                  |

### Environment variables
The api key can be set using the `RESCUE_TIME_API_KEY` environment variable.


Add`export RESCUE_TIME_API_KEY=[your api key]` to ~/.zshrc or ~/.bashrc (Windows: add to environment variables), restart terminal and run `rescuetime-summary`.



Usage examples: 
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
