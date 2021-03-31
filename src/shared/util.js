import React from 'react';
import { Circle, Popup } from 'react-leaflet';
import numeral from 'numeral';

export const sortData = data => {
    const sortedData = [...data];

    // a.cases & b.cases is basically res.data.cases from App.js
    return sortedData.sort((a, b) => ((a.cases > b.cases) ? -1 : 1));
}

// Color dictionary for type of cases selected

const casesTypeColors = {
    cases: {
        hex: "#fc8989",
        multiplier: 400,
    },
    recovered: {
        hex: "#7dd71d",
        multiplier: 400,
    },
    deaths: {
        hex: "#ff0000",
        multiplier: 2000,
    },
};

// Draw circles on the map with interactive tooltip
export const showDataOnMap = (data, casesType = 'cases') => (
    data.map(country => (
        <Circle
            center={[country.countryInfo.lat, country.countryInfo.long]}
            color={casesTypeColors[casesType].hex}
            fillColor={casesTypeColors[casesType].hex}
            fillOpacity={0.4}
            radius={
                Math.sqrt(country[casesType]) * casesTypeColors[casesType].multiplier
            }
        >
            <Popup>
                <div className="info-container">
                    <div
                        style={{ backgroundImage: `url(${country.countryInfo.flag})` }}
                        className="info-flag"
                    />
                    <div className="info-name">{country.country}</div>
                    <div className="info-confirmed">Cases: {numeral(country.cases).format("0,0")}</div>
                    <div className="info-recovered">Recovered: {numeral(country.recovered).format("0,0")}</div>
                    <div className="info-deaths">Deaths: {numeral(country.deaths).format("0,0")}</div>
                </div>
            </Popup>
        </Circle>
    ))
);

// Util function to print stats prettier
export const printStat = stat => stat ? `+${numeral(stat).format("0,0a")}` : "+0";