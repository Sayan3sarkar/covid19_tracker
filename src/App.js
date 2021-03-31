import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import axios from './shared/axios';
import { useEffect, useState } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';

import InfoBox from './components/InfoBox/InfoBox';
import Map from './components/Map/Map';
import Table from './components/Table/Table';
import { printStat, sortData } from './shared/util';
import LineGraph from './components/LineGraph/LineGraph';

function App() {

  // State for country list
  const [countries, setCountries] = useState([]);

  // State for tracking selected dropdown value from country list
  const [country, setCountry] = useState('worldwide');

  // State used to store individual country data from disease.sh when selected via the dropdowm
  const [countryInfo, setCountryInfo] = useState({});

  // State used for storing table data
  const [tableData, setTableData] = useState([]);

  // State for country list to be used in map
  const [mapCountries, setMapCountries] = useState([]);

  //State for maps
  // const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 77 });
  const [mapZoom, setMapZoom] = useState(3);

  // State for case type
  const [casesType, setCasesType] = useState('cases');

  useEffect(() => {
    // On 1st time page load,fetch details for 'worldwide'(deault dropdown value) and set countryInfo to that data
    axios.get('/v3/covid-19/all').then(res => {
      setCountryInfo(res.data);
    })
  }, [])

  useEffect(() => {
    const getCountriesData = () => {
      axios.get('/v3/covid-19/countries').then(({ data }) => {
        const countries = data.map(country => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ));
        const sortedData = sortData(data);
        setTableData(sortedData);

        setMapCountries(data);

        setCountries(countries);
      })
    }
    getCountriesData();
  }, [])

  // On selection of a dropdown item
  const onCountryChange = e => {
    const countryCode = e.target.value;
    setCountry(countryCode);
    const url = countryCode === 'worldwide' ? '/v3/covid-19/all' : `/v3/covid-19/countries/${countryCode}`;
    axios.get(url).then(({ data }) => {

      setCountryInfo(data);

      // Set mapCenter and mapZoom conditionally
      if (countryCode === "worldwide") {
        setMapCenter([34.80746, -40.4796]);
        setMapZoom(3);
      } else {
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      }
    })
  }

  return (
    <div className="app">

      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">WorldWide</MenuItem>
              {
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            onClick={e => setCasesType('cases')}
            title="Coronavirus Cases"
            cases={printStat(countryInfo.todayCases)}
            active={casesType === 'cases'}
            total={printStat(countryInfo.cases)} />
          <InfoBox
            onClick={e => setCasesType('recovered')}
            title="Recovered"
            cases={printStat(countryInfo.todayRecovered)}
            active={casesType === 'recovered'}
            total={printStat(countryInfo.recovered)} />
          <InfoBox
            isRed
            onClick={e => setCasesType('deaths')}
            title="Deaths"
            cases={printStat(countryInfo.todayDeaths)}
            active={casesType === 'deaths'}
            total={printStat(countryInfo.deaths)} />
        </div>
        <Map center={mapCenter} zoom={mapZoom} countries={mapCountries} casesType={casesType} />
      </div>

      <Card className="app__right">
        <CardContent>

          <h3>Live Cases By Country</h3>
          <Table countries={tableData} />
          <br />
          <h3>Worldwide new {casesType}</h3>
          <LineGraph casesType={casesType} className="app__graph" />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
