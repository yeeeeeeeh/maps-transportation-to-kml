# Transit Route to KML

A small web page that plans a public transport trip and downloads it as a KML file for Google Earth, Google My Maps, OsmAnd, Organic Maps or QGIS.

**Live page:** https://yeeeeeeeh.github.io/maps-transportation-to-kml/

## What it does

- Search for a start and destination (stations, stops, addresses or `lat,lon`), or click them on the map.
- Or paste a Google Maps directions link. The start, destination, time and depart/arrive-by setting are read from the link and the same trip is planned here. Short `maps.app.goo.gl` links must be opened in a browser first to get the long `google.com/maps/dir/…` address.
- Compare the options on the map, then download one or all of them.

Each KML contains one line per leg that follows the actual track, in the line's own colour, with times, platform, operator and line number. It can also include the boarding, alighting and intermediate stops. Legs carry time stamps, so Google Earth's time slider works.

## Retirement calculator

A second tab (`#retire`) works out how big a portfolio must be to pay a monthly cost from dividends alone, and whether your savings get you there by your retirement age.

- Inputs: age, retirement age, net salary, yearly raise, % of salary invested, money already invested, monthly cost in retirement (today's money), inflation, dividend yield and share price growth.
- Mortgage: today's balance plus periods (from year, to year, interest, monthly payment). An empty payment means a standard annuity that is paid off by the last year. The year-by-year table shows the interest and the amount owed. Payments come out of your salary while you work, and out of the portfolio after you retire.
- Dutch box 3 tax under both systems, side by side: the old system (tax on a deemed return over the tax-free wealth) and the new one (tax on the actual return, including unrealised price gains, over the tax-free return). Rates and allowances can be edited. Defaults are the 2025 rules and the bill for the new system.
- Results: the amount needed at retirement, what you will have, the % of salary you would need to invest to get there, when dividends stop covering spending, and how long the money lasts. There is also a chart and a year-by-year table.

Inputs are kept in your browser's local storage. Everything is an estimate with steady yearly returns, not financial advice.

## How it works

Everything runs in the browser. There is no server, no account and no stored data.

- Journey planning and place search: [Transitous](https://transitous.org) (MOTIS API). Data sources: https://transitous.org/sources/
- Map tiles: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Map library: [Leaflet](https://leafletjs.com) 1.9.4, bundled in `vendor/`
- Fonts: Barlow Condensed, Atkinson Hyperlegible and IBM Plex Mono (SIL Open Font License), bundled in `vendor/fonts/`

The page sends a strict Content Security Policy: it can only load its own files, map tiles from OpenStreetMap, and talk to the Transitous API.

## Run locally

Serve the folder with any static server, for example:

```sh
python3 -m http.server 8000
```

then open http://localhost:8000. Opening `index.html` straight from disk may block the API requests in some browsers.

## Deploying

Pushing to `main` runs `.github/workflows/pages.yml`, which publishes only `index.html`, `app.js`, `retire.js`, `style.css` and `vendor/` to GitHub Pages. In the repository settings, **Pages → Build and deployment → Source** must be set to **GitHub Actions**.

## Usage policy

Transitous is run by volunteers for free and open-source, non-commercial projects. Keep usage light and follow their [usage policy](https://transitous.org/api/).

## License

MIT. See [LICENSE](LICENSE). Bundled third-party files keep their own licenses (`vendor/leaflet-1.9.4/LICENSE`, `vendor/fonts/LICENSE-*.txt`).
