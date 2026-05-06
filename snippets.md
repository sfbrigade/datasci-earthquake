# Snippets

## Geocode on search

Attempt to use Mapbox geocoding to retrieve coordinates based on a search term (different from autocomplete)

```js
const fullAddress = event.target.value;

try {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${fullAddress}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
  const response = await fetch(url);
  const response_data = await response.json();

  if (
    response_data &&
    response_data.features &&
    response_data.features.length > 0
  ) {
    onSearchChange(response_data.features[0].center);
    // TODO: grab resolved address as well to update rest of UI
  }
} catch (err) {
  console.log(err);
}
```

## Responsive style props for Chakra UI v3

WORKS

```
mobileButton: {
  value: {
    _light: "0px 0px 3px #c8caceff",
    _dark: "0px 0px 3px #c8caceff",
  },
},

card: {
  value: {
    _light: "0px 5px 6px #c8caceff",
    _dark: "0px 5px 6px #c8caceff",
  },
},

card: {
  value: {
    _light: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}",
    _dark: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}",
  },
},

card: { value: { _light: "0px 5px 6px #c8caceff", _dark: "0px 5px 6px #c8caceff" }},

card: { value: { _light: "0 1 1.5 lightGrey", _dark: "0 1 1.5 lightGrey" }},

card: { value: {
  _light: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}",
  _dark: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}",
}},
```

DOES NOT WORK

```
card: { value: {
  _light: [":", "1", "1.5", "lightGrey"],
  _dark: ["0", "1", "1.5", "lightGrey"],
}},
```

## Manually craate a HAR for replaying MapBox API responses in Playwright (for eg mocking)

```shell
playwright open --save-har=./hars/example.har --save-har-glob=\"https://*.mapbox.com/**/*\" http://localhost:3000"
```
