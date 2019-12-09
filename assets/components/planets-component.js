import React from 'react';
import { Chart } from 'react-d3-core';
import { PieTooltip } from 'react-d3-tooltip';
import PropTypes from 'prop-types';
import swAxiosInstance from '../configs/axios-custom-instance';
import SearchBox from './search-box-component';
import {
  randomColor,
  populationFormatConverter,
  getPlanets
} from '../utilities/planet-utilities.js';

class Planets extends React.Component {
    constructor() {
      super();
      this.state = {
        planets: [],
        maxPopulation: 0,
        searchKeyword: '',
      }
      this.pieChartDetails = {
        title: "Planets",
        width: 1200,
        height: 600,
      }
    }

    search = (searchTerm) => {
      this.setState({ searchKeyword: searchTerm });
    }

    async fetchPlanets() {
      let max = 0, pageNo = 1;
      let results = await getPlanets(pageNo);

      while(results && results.data && results.data.next != null) {
        this.setState({ planets: [ ...this.state.planets, ...results.data.results ] });
        results = await getPlanets(++pageNo);
      }

      this.state.planets.forEach(function (planet) {
        if (planet.population != "unknown") {
          if (parseInt(planet.population, 10) > max) {
            max = parseInt(planet.population, 10);
          }
        }
      });
      this.setState({ maxPopulation: max });
    }

    componentDidMount() {
      this.fetchPlanets();
    }

    render() {
      let state = this.state;
      let { store } = this.context;
      let storeData = store.getState();

      return (
        <div class="col-md-12 col-sm-12 no-padding planets-component">
          <SearchBox search={this.search} />

          <div class="loggedin-user">
            Logged In User - { storeData.loginReducer.userDetails.name }
          </div>

          <div class="col-md-12 col-sm-12 planets-container">
            {
              this.state.planets.map(function (planet, index) {
                if (planet.name.toLowerCase().indexOf(state.searchKeyword.toLowerCase()) != -1) {
                  return (
                    <div
                      style={{
                        width: planet.population === 'unknown' ? 100 : 100 + ( 350 * ( parseInt(planet.population, 10)  / state.maxPopulation ) ) + 'px',
                        background: randomColor(),
                      }}
                      class="planets"
                      title={ 'Planet Name: ' + planet.name + '; Planet Population: ' + planet.population }
                      key={index}
                    >
                      <span class="planet-name">
                        { planet.name }
                      </span>
                      <span class="planet-population">
                        { populationFormatConverter(planet.population) }
                      </span>
                    </div>
                  );
                } else {
                  return null;
                }
              }).filter(function (updatedPlanet) {
                if (updatedPlanet !== null) {
                  return true;
                }

                return false;
              })
            }
          </div>
          <div class="col-md-12 col-sm-12">
            <PieTooltip
              title= {this.pieChartDetails.title}
              data= {this.state.planets}
              width= {this.pieChartDetails.width}
              height= {this.pieChartDetails.height}
              chartSeries= {
                [
                  ...this.state.planets.map(function (planet) {
                    return { field: planet.name, name: planet.name };
                  })
                ]
              }
              value = {(d) => { return d.population }}
              name = {(d) => { return d.name }}
            />
          </div>
        </div>
      )
    }
};

Planets.contextTypes = {
  store: PropTypes.object
};

export default Planets;
