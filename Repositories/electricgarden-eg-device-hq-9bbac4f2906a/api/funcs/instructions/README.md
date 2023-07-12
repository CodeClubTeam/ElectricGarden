# Instructions API

Purpose:

For devices to obtain settings and instructions (actions) to execute.

## API

### Retrieving settings and actions

GET `/api/instructions/v1/{serial}/settings` will get you the settings e.g.

```JSON
{
  "serial": "ABC123",
  "settings": {
    "readingsEndPoint": "https://egingestprod.azurewebsites.net/api/catm1?code=abcdef"
  }
}
```

GET `/api/instructions/v1/{serial}/actions` will get you the actions e.g.

```JSON
{
  "serial": "ABC123",
  "actions": [
    {
      "type": "SET_VARIABLES",
      "payload": {
        "counter1": 1
      }
    }
  ]
}
```

GET `/api/instructions/v1/{serial}` will get you an all-in-one payload including both settings and actions.

Success is `200` status.

### Adding an action

To add an action:

POST `/api/instructions/v1/{serial}/actions`

with body including `type` and optional `payload` property e.g.

```JSON
{
	"type": "SET_VARIABLES",
	"payload": {
		"counter1": 1
	}
}
```

Success is `201` status.

### Clearing actions

Once actions have been actioned, clear them so they won't be picked up
and re-actioned again:

DELETE `/api/instructions/v1/{serial}/actions`

It will return `204` status regardless of whether anything was there to delete.

### Updating Settings

_Not implemented yet_

May be PUT or PATCH on `/api/instructions/v1/{serial}/settings`.

### Resetting settings to default

_Not implemented yet_

May be DELETE on `/api/instructions/v1/{serial}/settings`.
