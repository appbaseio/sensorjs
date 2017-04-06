import React, { Component } from 'react';
import { ReactiveBase, SingleRange, ReactiveList } from '../app.js';
import { ResponsiveStory, combineStreamData } from '../middleware/helper.js';

export default class SingleRangeDefault extends Component {
	constructor(props) {
		super(props);
		this.onAllData = this.onAllData.bind(this);
	}

	componentDidMount() {
		ResponsiveStory();
	}

	onAllData(res, err) {
		let result = null;
		if(res) {
			let combineData = res.currentData;
			if(res.mode === 'historic') {
				combineData = res.currentData.concat(res.newData);
			}
			else if(res.mode === 'streaming') {
				combineData = combineStreamData(res.currentData, res.newData);
			}
			if (combineData) {
				result = combineData.map((markerData, index) => {
					let marker = markerData._source;
					return this.itemMarkup(marker, markerData);
				});
			}
		}
		return result;
	}

	itemMarkup(marker, markerData) {
		return (
			<a className="full_row single-record single_record_for_clone"
				href="#"
				key={markerData._id}>
				<div className="text-container full_row" style={{'paddingLeft': '10px'}}>
					<div className="text-head text-overflow full_row">
						<span className="text-head-info text-overflow">
							{marker.name ? marker.name : ''} - {marker.brand ? marker.brand : ''}
						</span>
						<span className="text-head-city">{marker.brand ? marker.brand : ''}</span>
					</div>
					<div className="text-description text-overflow full_row">
						<ul className="highlight_tags">
							{marker.price ? `Priced at $${marker.price}` : 'Free Test Drive'}
						</ul>
					</div>
				</div>
			</a>
		);
	}

	render() {
		return (
			<ReactiveBase
				app="car-store"
				credentials="cf7QByt5e:d2d60548-82a9-43cc-8b40-93cbbe75c34c"
			>
				<div className="row">
					<div className="col s6 col-xs-6">
						<SingleRange
							componentId="PriceSensor"
							appbaseField={this.props.mapping.price}
							title="SingleRange"
							data={
								[{"start": 0, "end": 100, "label": "Cheap"},
								{"start": 101, "end": 200, "label": "Moderate"},
								{"start": 201, "end": 500, "label": "Pricey"},
								{"start": 501, "end": 1000, "label": "First Date"}]
							}
							{...this.props}
						/>
					</div>

					<div className="col s6 col-xs-6">
						<ReactiveList
							componentId="SearchResult"
							appbaseField={this.props.mapping.name}
							title="Results"
							sortOptions={[
								{
									label: 'Lowest Price First',
									appbaseField: 'price',
									sortBy: 'asc'
								},
								{
									label: 'Highest Price First',
									appbaseField: 'price',
									sortBy: 'desc'
								},
								{
									label: 'Most rated',
									appbaseField: 'rating',
									sortBy: 'desc'
								}
							]}
							from={0}
							size={20}
							onAllData={this.onAllData}
							react={{
								"and": "PriceSensor"
							}}
						/>
					</div>
				</div>
			</ReactiveBase>
		);
	}
}

SingleRangeDefault.defaultProps = {
	mapping: {
		price: 'price',
		name: 'name'
	}
};
