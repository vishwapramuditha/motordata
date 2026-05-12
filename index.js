/**
 * MotorData API SDK
 * A lightweight client for accessing the open-source motorsport data API.
 */

const BASE_URL = 'https://vishwapramuditha.github.io/motordata/data';

async function fetchJson(endpoint) {
    // Determine the environment (Node.js vs Browser) to ensure fetch is available.
    // Node 18+ has native fetch.
    const url = `${BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`MotorData API Error: ${response.status} ${response.statusText} at ${url}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error(`MotorData Fetch Failed: ${error.message}`);
    }
}

const motordata = {
    /**
     * Formula 1 Data
     */
    f1: {
        getDrivers: () => fetchJson('/f1/drivers.json'),
        getResults: (year = '2026') => fetchJson(`/f1/${year}/results.json`)
    },

    /**
     * MotoGP Data
     */
    motogp: {
        getRiders: () => fetchJson('/motogp/riders.json'),
        getResults: (year = '2026', circuit = 'portimao') => fetchJson(`/motogp/${year}/${circuit}/results.json`)
    },

    /**
     * World Rally Championship Data
     */
    wrc: {
        getDrivers: () => fetchJson('/wrc/drivers.json'),
        getStages: (year = '2026', stageId = 'monte-carlo-ss1') => fetchJson(`/wrc/${year}/${stageId}/stages.json`)
    },

    /**
     * IndyCar Data
     */
    indycar: {
        getDrivers: () => fetchJson('/indycar/drivers.json'),
        getStandings: (year = '2026', round = 'round-1') => fetchJson(`/indycar/${year}/${round}/standings.json`)
    }
};

module.exports = motordata;
