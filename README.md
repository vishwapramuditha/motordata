# MotorData API

The open-source API for Motorsport data.

Access historical results, telemetry, timing, and session data from every major racing series including Formula 1, MotoGP, WRC, and IndyCar. Built for fans to visualize, learn, and create.

## Features
- **Zero Authentication**: Instantly execute GET requests securely from any frontend application without API keys.
- **Unified Data Ecosystem**: One standard architecture providing flawless integration across four major racing tiers.
- **Fast and Free**: Lightning-fast JSON responses hosted on GitHub Pages.

## Documentation
Check out our official documentation at: [https://vishwapramuditha.github.io/motordata/website/docs.html](https://vishwapramuditha.github.io/motordata/website/docs.html)

## How to use

### 1. Via NPM (Recommended)
You can easily add MotorData to your Node.js or frontend projects using NPM. The official SDK provides $0-cost, direct access to the GitHub Pages JSON API without any complex `fetch` logic.

```bash
npm install github:vishwapramuditha/motordata
```

```javascript
const motordata = require('motordata');

// Fetch F1 Drivers
motordata.f1.getDrivers().then(drivers => console.log(drivers));

// Fetch WRC Stages
motordata.wrc.getStages('2026', 'monte-carlo-ss1').then(stages => console.log(stages));
```

### 2. Via Raw HTTP Requests
If you prefer not to use the SDK, you can fetch data directly via standard HTTP GET requests:

```javascript
fetch("https://vishwapramuditha.github.io/motordata/data/f1/drivers.json")
  .then(res => res.json())
  .then(data => console.log(data));
```

## Contributing
We welcome contributions! If you'd like to help expand our datasets or improve schemas:

1. Fork this repository.
2. Add or modify schemas in the `schemas/` directory.
3. Add or update data in the `data/` directory.
4. Run validation locally before opening a Pull Request.

### Validation
To ensure data integrity, we use `ajv-cli` to validate JSON files against their corresponding schemas.

First, install dependencies:
```bash
npm install
```

Then, run the validation script:
```bash
npm run validate
```

If all tests pass, you're ready to submit your PR!

## License
This project is open-source and available under the MIT License. It is an educational API and is not affiliated with Formula One Management or any primary motorsport commercial rights holders.
