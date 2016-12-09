import { default as React, Component } from 'react';
import { render } from 'react-dom';

export class StaticSearch extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchValue: ''
		};
		this.handleChange = this.handleChange.bind(this);
	}
	componentDidUpdate() {
	}
	handleChange(event) {
		let value = event.target.value;
		this.setState({
			searchValue: value
		}, function () {
			this.props.changeCallback(this.state.searchValue);
		}.bind(this));
	}
	render() {
		return (
			<div className="ab-StaticSearchComponent ab-input-container col s12 col-xs-12">
				<input type="text" className="ab-input col s12 col-xs-12 form-control"
					value={this.state.searchValue}
					placeholder={this.props.placeholder}
					onChange={this.handleChange} />
			</div>
		);
	}
}
