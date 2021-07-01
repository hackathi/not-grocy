<h2>not-grocy</h2>
<h3>ERP beyond your fridge</h3>
<h5>not-grocy is not grocy, the web-based self-hosted groceries & household management solution for your home</h5>

-----

## Give it a try
- Unfortunately, public demos are not set up yet.

## Questions / Help / Bug reporting / Feature requests
There is the [r/grocy subreddit](https://www.reddit.com/r/grocy) to connect with other grocy users and getting help.

If you've found something that does not work or if you have an idea for an improvement or new things which you would find useful, feel free to open a request on the [issue tracker](https://github.com/mistressofjellyfish/not-grocy/issues) here.

## Community plugins

At the moment (June 2021), plugins that work with grocy should work with not-grocy without too much trouble. 

You developed a plugin for grocy and want to migrate? Keep an eye on [the migration docs](https://github.com/mistressofjellyfish/not-grocy/tree/master/docs/migration) to figure out what's changed.

## Motivation
A household needs to be managed. While grocy is a nice tool that helps a lot, it's UI is sluggish, dated and plainly doesn't work on devices with limited hardware. This fork adresses that and focuses on bug fixing and speed improvements
before adding new features, slowly re-writing the UI in modern technologies that work in your browser, on your desktop or the phone of your choice.

I hope that some day this fork won't be a fork anymore, but until we get there, enjoy the speed.

## How to install
Most guides that work with grocy ≥ 3.0 should work to install not-grocy.

not-grocy is technically a pretty simple PHP application, so the basic notes to get it running are:
- Unpack the [latest release](https://github.com/mistressofjellyfish/not-grocy/releases)
- Copy `config-dist.php` to `data/config.php` + edit to your needs
- Ensure that the `data` directory is writable
- The webserver root should point to the `public` directory
- Include `try_files $uri /index.php$is_args$query_string;` in your location block if you use nginx
  - Or disable URL rewriting (see the option `DISABLE_URL_REWRITING` in `data/config.php`)
  - There is a very minimal nginx config that is used for vagrant in `buildfiles/`. You can use it
    as a starting point for your own.
- Based on user reports, the minmimum required/working runtime is PHP 7.2 with SQLite 3.9.0
  - I try to test on the versions that are in debian stable (currently: php 7.3 and 3.27.2),
    but until some automated tests are set up, my development environment is php 7.4 and whatever sqlite
    version currently is avaliable on homebrew.
- &rarr; Default login is user `admin` with password `admin`, please change the password immediately (user menu at the top right corner)

Alternatively, to set up a development environment or run the unstable development version, follow these steps:

1. clone this repository. Optionally check out the tag you are interested in.
2. ensure that both `composer` and `yarn` are available in your `PATH`.
3. `make manifest publish` ensures that all dependencies are up-to-date, builds and minifies
   not-grocys frontend assets.

   *Important*: This command takes some time (about 2 minutes), because the site assets
   will be minified for production, and this is an expensive step. node being single-threaded 
   doesn't particularly like this. To achieve some speedup and use your system efficiently, use 
   `make`s `-j [jobs]` flag (see `man make` for more information)

   If you don't care as much about asset size (you should) or want to run a development environment,
   use `make build`, which doesn't minify and runs in well under a minute.

   To start a dynamic development environment, use `make watch`. It starts a php development webserver
   for you. Changes in files will be detected and dynamically recompiled.

You can also setup a development environment in one line of shell:

```sh
git pull https://github.com/mistressofjellyfish/not-grocy.git && cd not-grocy && make -j4 build
```

## How to run using Docker

Unfortunately, there is no `Dockerfile` yet. Contributions are welcome!

## How to update
Just overwrite everything with the latest release while keeping the `data` directory, check `config-dist.php` for new configuration options and add them to your `data/config.php` where appropriate (the default values from `config-dist.php` will be used for not in `data/config.php` defined settings). Just to be sure, please empty `data/viewcache`.

## Localization
not-grocy is fully localizable - the default language is English (integrated into code), a German localization is always maintained by me. As the localization system is currently under active development, things will probably change on how not-grocy is translated and where you can help.

## Things worth to know

### REST API & data model documentation
See the integrated Swagger UI instance on `/api`.

### Barcode readers & camera scanning
Some fields (with a barcode icon above) also allow to select a value by scanning a barcode. It works best when your barcode reader prefixes every barcode with a letter which is normally not part of a item name (I use a `$`) and sends a `TAB` after a scan.

If your grocy instance is served via HTTPS, it's also possible to use your device camera to scan a barcode by using the camera button on the right side of the corresponding field (powered by [Quagga2](https://github.com/ericblade/quagga2), totally offline / client-side camera stream processing.

_However: We recommend to use a USB barcode laser scanner. They are cheap and work 1000 % better, faster, under any lighting condition and from any angle. You can pick them up cheap on ebay. Make sure they can decode 2D barcodes. Also, reading 2D barcodes and grocycode does not work with Quagga2 at the moment, because there is absolutely no working datamatrix2 reader for javascript. Sorry!_

### Input shorthands for date fields
For (productivity) reasons all date (and time) input (and display) fields use the ISO-8601 format regardless of localization.
The following shorthands are available:
- `MMDD` gets expanded to the given day on the current year, if > today, or to the given day next year, if < today, in proper notation
  - Example: `0517` will be converted to `2018-05-17`
- `YYYYMMDD` gets expanded to the proper ISO-8601 notation
  - Example: `20190417` will be converted to `2019-04-17`
- `YYYYMMe` or `YYYYMM+` gets expanded to the end of the given month in the given year in proper notation
  - Example: `201807e` will be converted to `2018-07-31`
- `x` gets expanded to `2999-12-31` (which I use for products which are never overdue)
- Down/up arrow keys will increase/decrease the date by 1 day
- Right/left arrow keys will increase/decrease the date by 1 week
- Shift + down/up arrow keys will increase/decrease the date by 1 month
- Shift + right/left arrow keys will increase/decrease the date by 1 year

### Keyboard shorthands for buttons
Wherever a button contains a bold highlighted letter, this is a shortcut key.
Example: Button "**P** Add as new product" can be "pressed" by using the `P` key on your keyboard.

### Barcode lookup via external services
Products can be directly added to the database via looking them up against external services by a barcode.
This is currently only possible through the REST API.
There is no plugin included for any service, see the reference implementation in `data/plugins/DemoBarcodeLookupPlugin.php`.

### Database migrations
Database schema migration is automatically done when visiting the root (`/`) route (click on the logo in the left upper edge).

_Please note: Database migrations are supposed to work between releases, not between every commit. If you want to run the current `master` branch (which is the development version), however, you need to handle that (and maybe more) yourself._

### Disable certain features
If you don't use certain feature sets of grocy (for example if you don't need "Chores"), there are feature flags per major feature set to hide/disable the related UI elements (see `config-dist.php`)

### Adding your own CSS or JS without to have to modify the application itself
- When the file `data/custom_js.html` exists, the contents of the file will be added just before `</body>` (end of body) on every page
- When the file `data/custom_css.html` exists, the contents of the file will be added just before `</head>` (end of head) on every page

**Important:** The behavior of modals has fundamentally changed since v3.0.1. Your custom javascript and CSS will only
run *once* per root page and not be re-run when opening subviews. While this is fine for CSS, *it probably breaks your
 javascript*. For the moment, you can watch bootstraps modal opened event to react to changes.

Please also note that this feature is fundamentally incompatible with what is planned on the roadmap. There
will be a replacement plugin system, though.

### Demo mode
When the `MODE` setting is set to `dev`, `demo` or `prerelease`, the application will work in a demo mode which means authentication is disabled and some demo data will be generated during the database schema migration.

### Embedded mode

Currently, not-grocy is not available as a desktop application. However, bundling it using electron is on our
roadmap! Stay tuned for updates. 

## Contributing

You want to help make not-grocy faster, better, harder, stronger? Thank you!

- If you encountered a bug, please open an issue.
- If you happen to know how to code, feel free to open a pull request! If it fixes an existing bug, please leave a note in the corresponding issue.
- A nice message in the (discussions)[https://github.com/mistressofjellyfish/not-grocy/discussions] also always goes a long way.
- If none of the above fit's your bill, and you still want to make a contribution, you can always help me out by buying one of my book(s) (which are, unfortunately, written in german).

If you like to contribute code, you are very welcome! Please read `docs/contributing.md`.

## Roadmap

See [the project page](https://github.com/mistressofjellyfish/not-grocy/projects) for the current roadmap.

## Screenshots
#### Stock overview
![Stock overview](https://github.com/mistressofjellyfish/not-grocy/raw/master/.github/publication_assets/stock.png "Stock overview")

#### Shopping List
![Shopping List](https://github.com/mistressofjellyfish/not-grocy/raw/master/.github/publication_assets/shoppinglist.png "Shopping List")

#### Meal Plan
![Meal Plan](https://github.com/mistressofjellyfish/not-grocy/raw/master/.github/publication_assets/mealplan.png "Meal Plan")

#### Chores overview
![Chores overview](https://github.com/mistressofjellyfish/not-grocy/raw/master/.github/publication_assets/chores.png "Chores overview")

## License
The MIT License (MIT)
