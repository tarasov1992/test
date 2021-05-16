import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import CoinGecko from 'coingecko-api'
import reportWebVitals from './reportWebVitals';
import { findByTestId } from '@testing-library/dom';

class SimetriROI extends React.Component {
  constructor(props) {
    super(props)
    this.updateROI = this.updateROI.bind(this)
    this.updatePorfolioValue = this.updatePorfolioValue.bind(this)
    this.state = {
      activePicks:  active,
      inactivePicks: inactive,
      roi: [],
      portfolioValue: []
    }
  }
  updateROI(pctChange) {
    this.setState((prevState) => ({
      roi: prevState.roi.concat([pctChange])
    }))
  }
  updatePorfolioValue(pickValue) {
    this.setState((prevState) => ({
      portfolioValue: prevState.portfolioValue.concat([pickValue])
    }))
  }
  render() {
    return (
      <div>
        <Header />
        <ActivePicks 
          activePicks={this.state.activePicks}
          updateROI={this.updateROI}
          updatePorfolioValue={this.updatePorfolioValue}
        />
        <InactivePicks
          inactivePicks={this.state.inactivePicks}
          updateROI={this.updateROI}
          updatePorfolioValue={this.updatePorfolioValue}
        />
        <PortfolioSummary 
          roi={this.state.roi}
          portfolioValue={this.state.portfolioValue}
        />
      </div>
    )
  }
}

const Header = () => {
  return (
    <div>
      <h2>SIMETRI Portfolio Tracker</h2>
    </div>
  )
}

const ActivePicks = (props) => {
  return (
    <div> 
      <h3>Active Picks</h3>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Pick</th>
            <th>Pick Price ($USD)</th>
            <th>Live Price ($USD)</th>
            <th>Price Change ($USD)</th>
            <th>Price Change (%)</th>
            <th>Live Market Cap ($USD)</th>
            <th>Value of $1000 Investment Today</th>
            </tr>
        </thead>
        <tbody>
        {
          props.activePicks.map((pick) => (
            <Pick 
              key={pick.id} 
              pick={pick} 
              updateROI={props.updateROI}
              updatePorfolioValue={props.updatePorfolioValue}
            />
          ))
        }
        </tbody>
      </table>
    </div>
  )
}

const InactivePicks = (props) => {
  return (
    <div> 
      <h3>Inactive Picks</h3>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Pick</th>
            <th>Pick Price ($USD)</th>
            <th>Live Price ($USD)</th>
            <th>Price Change ($USD)</th>
            <th>Price Change (%)</th>
            <th>Live Market Cap ($USD)</th>
            <th>Value of $1000 Investment Today</th>
            </tr>
        </thead>
        <tbody>
        {
          props.inactivePicks.map((pick) => (
            <Pick 
              key={pick.id} 
              pick={pick} 
              updateROI={props.updateROI}
              updatePorfolioValue={props.updatePorfolioValue}
            />
          ))
        }
        </tbody>
      </table>
    </div>
  )
}

const Pick = (props) => {
  const [name, setName] = useState(undefined)
  const [price, setPrice] = useState(undefined)
  const [mktCap, setMktCap] = useState(undefined)
  const cg = new CoinGecko()

  useEffect(() => {
    const getName = async (id) => {
      const response = await cg.coins.fetch(id, {});
      return response.data.name
    }

    const livePrice = async(id) => {
      const response = await cg.coins.fetch(id, {});
      return response.data.market_data.current_price.usd
    }
    const liveMarketCap = async(id) => {
      const response = await cg.coins.fetch(id, {});
      return response.data.market_data.market_cap.usd
    }

    getName(props.pick.id)
      .then((name) => setName(name))
    livePrice(props.pick.id)
      .then(price => {
        setPrice(price)
        updateROI(price)
        updatePortfolioValue(price)
      })
    liveMarketCap(props.pick.id).then(mktCap => setMktCap(mktCap))
  }, [])

  const updateROI = (price) => {
    const pctChange = ((price - props.pick.pickPrice) / props.pick.pickPrice) * 100

    props.updateROI(pctChange)
  }

  const updatePortfolioValue = (price) => {
    const pickValue = 1000 + 1000 * (price - props.pick.pickPrice) / props.pick.pickPrice

    props.updatePorfolioValue(pickValue)
  }

  return (
      <tr>
        <td>{props.pick.month}</td>
        <td>{name}</td>
        <td>{props.pick.pickPrice}</td>
        <td>{price}</td>
        <td>{price && price - props.pick.pickPrice}</td>
        <td>{price && ((price - props.pick.pickPrice) / props.pick.pickPrice) * 100}</td>
        <td>{mktCap}</td>
        <td>{price && 1000 + 1000 * (price - props.pick.pickPrice) / props.pick.pickPrice}</td>
      </tr> 
  )
}

const PortfolioSummary = (props) => {
  const calculateRoi = (roi) => {
    let sum = 0
    for (let i = 0; i < roi.length; i++) {
      sum += roi[i]
    }

    return sum / roi.length
  }

  const calculateTotalValue = (portfolioValue) => {
    let sum = 0
    for (let i=0; i < portfolioValue.length; i++) {
      sum += portfolioValue[i]
    }

    return sum
  }

  const totalRoi = calculateRoi(props.roi)
  const totalValue = calculateTotalValue(props.portfolioValue)

  return (
    <div>
      <h3>Portfolio Summary</h3>
      <p>PoM ROI: {totalRoi}</p>
      <p>Portfolio Value: {totalValue}</p>
    </div>
  )
}

const active = [
  {
    id: 'thorchain',
    month: 'Oct 2019',
    pickPrice: 0.01197
  },
  {
    id: 'klay-token',
    month: 'Nov 2019',
    pickPrice: 0.157056
  },
  {
    id: 'tellor',
    month: 'Dec 2019',
    pickPrice: 4.9
  },
  {
    id: 'kava',
    month: 'Jan 2020',
    pickPrice: 1.03
  },
  {
    id: 'republic-protocol',
    month: 'Mar 2020',
    pickPrice: 0.07133
  },
  {
    id: 'band-protocol',
    month: 'Apr 2020',
    pickPrice: 0.564327
  },
  {
    id: 'kyber-network',
    month: 'Jun 2020',
    pickPrice: 0.873952
  },
  {
    id: 'chainx',
    month: 'Aug 2020',
    pickPrice: 3.21
  },
  {
    id: 'kusama',
    month: 'Nov 2020',
    pickPrice: 33.4
  },
  {
    id: 'hegic',
    month: 'Nov 2020',
    pickPrice: 0.216
  },
  {
    id: 'octofi',
    month: 'Dec 2020',
    pickPrice: 29.82
  },
  {
    id: 'parsiq',
    month: 'Jan 2021',
    pickPrice: 0.51
  },
  {
    id: 'dfohub',
    month: 'Feb 2021',
    pickPrice: 3.19
  },
  {
    id: 'nftx',
    month: 'Mar 2021',
    pickPrice: 251.03
  },
  {
    id: 'whiteheart',
    month: 'Mar 2021',
    pickPrice: 3669.12
  },
  {
    id: 'sake-token',
    month: 'Apr 2021',
    pickPrice: 0.3553
  },
  {
    id: 'ice-token',
    month: 'May 2021',
    pickPrice: 4.54
  },
]

const inactive= [
  {
    id: 'keep-network',
    month: 'Sep 2020',
    pickPrice: 0.820238
  },
  {
    id: 'huobi-token',
    month: 'Feb 2020',
    pickPrice: 4.62
  },
  {
    id: 'harmony',
    month: 'Aug 2020',
    pickPrice: 0.01151
  },
  {
    id: 'theta-token',
    month: 'Jul 2019',
    pickPrice: 0.12
  },
  {
    id: 'proton',
    month: 'May 2020',
    pickPrice: 0.019986
  },
  {
    id: 'aurora-dao',
    month: 'Jul 2020',
    pickPrice: 0.034783
  },
  {
    id: 'switcheo',
    month: 'Jul 2020',
    pickPrice: 0.015325
  },
  {
    id: 'revv',
    month: 'Oct 2020',
    pickPrice: 0.017477
  },
  {
    id: 'rif-token',
    month: 'Sep 2019',
    pickPrice: 0.139979
  },
]

ReactDOM.render(
  <React.StrictMode>
    <SimetriROI 
      // activePicks={activePicks}
      // inactivePicks={inactivePicks}
    />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
