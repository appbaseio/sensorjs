import { default as React, Component } from 'react';
import Select from 'react-select';
import classNames from 'classnames';
import { manager } from '../middleware/ChannelManager.js';
var helper = require('../middleware/helper.js');

export class DataSearch extends Component {
	constructor(props, context) {
		super(props);
		this.state = {
			items: [],
			currentValue: null,
			isLoading: false,
			options: [],
			rawData: {
				hits: {
					hits: []
				}
			}
		};
		this.type = 'match_phrase';
		this.channelId = null;
		this.channelListener = null;
		this.fieldType = typeof this.props.appbaseField;
		this.handleSearch = this.handleSearch.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.setValue = this.setValue.bind(this);
		this.defaultSearchQuery = this.defaultSearchQuery.bind(this);
		this.previousSelectedSensor = {};
	}

	// Get the items from Appbase when component is mounted
	componentDidMount() {
		this.setQueryInfo();
		this.createChannel();
	}

	// stop streaming request and remove listener when component will unmount
	componentWillUnmount() {
		if(this.channelId) {
			manager.stopStream(this.channelId);
		}
		if(this.channelListener) {
			this.channelListener.remove();
		}
	}

	componentWillUpdate() {
		if (this.props.defaultSelected && this.defaultSelected != this.props.defaultSelected) {
			this.defaultSelected = this.props.defaultSelected;
			this.setValue(this.defaultSelected);
			this.handleSearch({
				value: this.defaultSelected
			});
		}
	}

	// set the query type and input data
	setQueryInfo() {
		let obj = {
				key: this.props.componentId,
				value: {
					queryType: this.type,
					inputData: this.props.appbaseField,
					customQuery: this.props.customQuery ? this.props.customQuery : this.defaultSearchQuery
				}
		};
		helper.selectedSensor.setSensorInfo(obj);
		let searchObj = {
				key: this.props.searchInputId,
				value: {
					queryType: 'multi_match',
					inputData: this.props.appbaseField,
					customQuery: this.defaultSearchQuery
				}
		};
		helper.selectedSensor.setSensorInfo(searchObj);
	}

	// Create a channel which passes the react and receive results whenever react changes
	createChannel() {
		let react = this.props.react ? this.props.react : {};
		if(react && react.and && typeof react.and === 'string') {
			react.and = [react.and];
		} else {
			react.and = react.and ? react.and : [];
		}
		react.and.push(this.props.searchInputId);
		var channelObj = manager.create(this.context.appbaseRef, this.context.type, react);
		this.channelId = channelObj.channelId;
		this.channelListener = channelObj.emitter.addListener(channelObj.channelId, function(res) {
			let data = res.data;
			let rawData;
			if(res.mode === 'streaming') {
				rawData = this.state.rawData;
				rawData.hits.hits.push(res.data);
			} else if(res.mode === 'historic') {
				rawData = data;
			}
			this.setState({
				rawData: rawData
			});
			if (this.props.autocomplete) {
				this.setData(rawData);
			}
		}.bind(this));
	}

	//default query
	defaultSearchQuery(value) {
		if (value) {
			if (this.fieldType == 'string') {
				return {
					"match_phrase_prefix": {
						[this.props.appbaseField]: value
					}
				};
			} else {
				let query = [];
				this.props.appbaseField.map(field => {
					query.push({
						"match_phrase_prefix": {
							[field]: value
						}
					})
				});
				return {
					bool: {
						should: query,
						minimum_should_match: 1
					}
				};
			}
		}
	}

	// set value to search
	setValue(value) {
		var obj = {
			key: this.props.searchInputId,
			value: value
		};
		helper.selectedSensor.set(obj, true);
		if(value && value.trim() !== '') {
			this.setState({
				options: [{
					label: value,
					value: value
				}],
				isLoadingOptions: true,
				currentValue: value
			});
		} else {
			this.setState({
				options: [],
				isLoadingOptions: false,
				currentValue: value
			});
		}
	}

	// set data after get the result
	setData(data) {
		let options = [];
		let searchField = null;
		if (this.fieldType == 'string') {
			searchField = `hit._source.${this.props.appbaseField}.trim()`;
		}
		// Check if this is Geo search or field tag search
		if (this.props.isGeoSearch) {
			// If it is Geo, we return the location field
			let latField = `hit._source.${this.props.latField}`;
			let lonField = `hit._source.${this.props.lonField}`;
			data.hits.hits.map((hit) => {
				let location = {
					lat: eval(latField),
					lon: eval(lonField)
				};
				if (searchField) {
					options.push({ value: location, label: eval(searchField) });
				} else {
					if (this.fieldType == 'object') {
						this.props.appbaseField.map(field => {
							let tempField = `hit._source.${field}`
							if (eval(tempField)) {
								options.push({ value: location, label: eval(tempField) });
							}
						})
					}
				}
			});
		} else {
			data.hits.hits.map((hit) => {
				if (searchField) {
					options.push({ value: eval(searchField), label: eval(searchField) });
				} else {
					if (this.fieldType == 'object') {
						this.props.appbaseField.map(field => {
							let tempField = `hit._source.${field}`
							if (eval(tempField)) {
								options.push({ value: eval(tempField), label: eval(tempField) });
							}
						});
					}
				}
			});
		}
		if (this.state.currentValue && this.state.currentValue.trim() !== '') {
			options.unshift({
				label: this.state.currentValue,
				value: this.state.currentValue
			});
		}
		options = this.removeDuplicates(options, "label");
		this.setState({
			options: options,
			isLoadingOptions: false
		});
	}

	// Search results often contain duplicate results, so display only unique values
	removeDuplicates(myArr, prop) {
		return myArr.filter((obj, pos, arr) => {
			return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
		});
	}

	// When user has selected a search value
	handleSearch(currentValue) {
		let value = currentValue ? currentValue.value : null;
		value = value === 'null' ? null : value;
		var obj = {
			key: this.props.componentId,
			value: value
		};
		helper.selectedSensor.set(obj, true);
		this.setState({
			currentValue: value
		});
	}

	handleInputChange(event) {
		let inputVal = event.target.value;
		this.setState({
			'currentValue': inputVal
		});
		var obj = {
			key: this.props.componentId,
			value: inputVal
		};

		// pass the selected sensor value with componentId as key,
		let isExecuteQuery = true;
		helper.selectedSensor.set(obj, isExecuteQuery);
	}

	render() {
		let title = null;
		if(this.props.title) {
			title = (<h4 className="rbc-title col s12 col-xs-12">{this.props.title}</h4>);
		}
		let cx = classNames({
			'rbc-title-active': this.props.title,
			'rbc-title-inactive': !this.props.title,
			'rbc-placeholder-active': this.props.placeholder,
			'rbc-placeholder-inactive': !this.props.placeholder,
			'rbc-autocomplete-active': this.props.autocomplete,
			'rbc-autocomplete-inactive': !this.props.autocomplete
		});

		return (
			<div className={`rbc rbc-datasearch col s12 col-xs-12 card thumbnail ${cx}`}>
				{title}
				{
					this.props.autocomplete ?
					<Select
						isLoading={this.state.isLoadingOptions}
						value={this.state.currentValue}
						options={this.state.options}
						onInputChange={this.setValue}
						onChange={this.handleSearch}
						onBlurResetsInput={false}
						{...this.props}
					/> :
					<div className="rbc-search-container col s12 col-xs-12">
						<input
							type="text"
							className="rbc-input"
							placeholder={this.props.placeholder}
							value={this.state.currentValue ? this.state.currentValue : ''}
							onChange={this.handleInputChange}
						/>
						<span className="rbc-search-icon"></span>
					</div>
				}
			</div>
		);
	}
}

DataSearch.propTypes = {
	componentId: React.PropTypes.string.isRequired,
	appbaseField : React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.arrayOf(React.PropTypes.string)
	]),
	title: React.PropTypes.string,
	placeholder: React.PropTypes.string,
	autocomplete: React.PropTypes.bool,
	defaultSelected: React.PropTypes.string
};

// Default props value
DataSearch.defaultProps = {
	placeholder: "Search",
	autocomplete: true
};

// context type
DataSearch.contextTypes = {
	appbaseRef: React.PropTypes.any.isRequired,
	type: React.PropTypes.any.isRequired
};
