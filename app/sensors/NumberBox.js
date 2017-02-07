import React, {Component} from 'react';
import classNames from 'classnames';

import {manager} from '../middleware/ChannelManager.js';
const helper = require('../middleware/helper.js');

const TitleComponent = (props) => (
	<h4 className="rbc-title col s12 col-xs-12">{props.title}</h4>
);

const NumberBoxButtonComponent = (props) => {
	const cx = classNames({
		'rbc-btn-active': props.isActive,
		'rbc-btn-inactive': !props.isActive
	})
	const {type} = props;
	const increment = type == 'plus' ? 1 : -1;

	return (
		<button className={`btn rbc-btn ${cx}`} onClick={props.isActive && (() => props.handleChange(increment))}>
			<span className={`fa fa-${type} rbc-icon`}></span>
		</button>
	);
};

const NumberComponent = (props) => {
	const {label, max, min, handleChange} = props;
	const value = props.value != undefined ? props.value : min;
	const isPlusActive = max != undefined ? value < max : true;
	const isMinusActive = min != undefined ? value > min : true;

	return (
		<div className="rbc-numberbox-container col s12 col-xs-12">
			<div className="rbc-label">{label}</div>
			<div className="rbc-numberbox-btn-container">
				<NumberBoxButtonComponent isActive={isMinusActive} handleChange={handleChange} type="minus" />
				<span className="rbc-numberbox-number">{value}</span>
				<NumberBoxButtonComponent isActive={isPlusActive} handleChange={handleChange} type="plus" />
			</div>
		</div>
	);
};

class NumberBox extends Component {
	constructor(props, context) {
		super(props);
		const {defaultSelected, focused} = this.props;
		this.state = {
			currentValue: defaultSelected,
			focused: focused
		}
		this.type = 'term';
		this.handleChange = this.handleChange.bind(this);
		this.defaultQuery = this.defaultQuery.bind(this);
	}

	componentDidMount() {
		this.setQueryInfo();
		this.handleChange();
	}

	componentWillReceiveProps(nextProps) {
		setTimeout(() => {
			if (nextProps.defaultSelected !== this.state.currentValue) {
				this.setState({
					currentValue: nextProps.defaultSelected
				});
			}
		}, 300);
	}

	// build query for this sensor only
	defaultQuery(value) {
		return {
			[this.type]: {
				[this.props.appbaseField]: value
			}
		};
	}

	setQueryInfo() {
		const {componentId, appbaseField} = this.props;
		const obj = {
			key: componentId,
			value: {
				queryType: this.type,
				inputData: appbaseField,
				defaultQuery: this.defaultQuery
			}
		};
		helper.selectedSensor.setSensorInfo(obj);
	}

	// use this only if want to create actuators
	// Create a channel which passes the actuate and receive results whenever actuate changes
	createChannel() {
		const actuate = this.props.actuate ? this.props.actuate : {};
		const channelObj = manager.create(this.context.appbaseRef, this.context.type, actuate);
	}

	// handle the input change and pass the value inside sensor info
	handleChange(increment=0) {
		const {componentId, data} = this.props;
		let {min, max} = data;
		let inputVal = this.state.currentValue;

		min = min != undefined ? min : inputVal-1;
		max = max != undefined ? max : inputVal+1;

		if (increment > 0 && inputVal < max) {
			inputVal += 1;
		} else if (increment < 0 && inputVal > min) {
			inputVal -= 1;
		}

		this.setState({
			currentValue: inputVal
		});

		const obj = {
			key: componentId,
			value: inputVal
		};
		helper.selectedSensor.set(obj, true);
	}

	render() {
		const {title, data, labelPosition} = this.props;
		const {currentValue} = this.state;
		const ComponentTitle = title ? <TitleComponent title={title}/> : null;
		const cx = classNames({
			'rbc-title-active': title,
			'rbc-title-inactive': !title
		});
		return (
			<div className={`rbc rbc-numberbox col s12 col-xs-12 card thumbnail ${cx} rbc-label-${labelPosition}`}>
				<div className="row">
					{ComponentTitle}
					<NumberComponent
						handleChange={this.handleChange}
						value={currentValue}
						label={data.label}
						min={data.min}
						max={data.max}
					/>
				</div>
			</div>
		);
	}
};

NumberBox.propTypes = {
	componentId: React.PropTypes.string.isRequired,
	appbaseField: React.PropTypes.string.isRequired,
	title: React.PropTypes.string,
	data: React.PropTypes.shape({
		min: helper.validateThreshold,
		max: helper.validateThreshold,
		label: React.PropTypes.string
	}),
	defaultSelected:  helper.valueValidation,
	labelPosition: React.PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

// context type
NumberBox.contextTypes = {
	appbaseRef: React.PropTypes.any.isRequired,
	type: React.PropTypes.any.isRequired
};

export {NumberBox};