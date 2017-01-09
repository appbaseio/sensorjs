import { default as React, Component } from 'react';
import { render } from 'react-dom';

export class ItemList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedItem: []
		};
		this.defaultSelected = this.props.defaultSelected;
		this.defaultAllowed = true;
		this.handleClick = this.handleClick.bind(this);
	}

	componentWillUpdate() {
		if (this.defaultSelected != this.props.defaultSelected) {
			this.defaultSelected = this.props.defaultSelected;
			this.defaultSelection();
		}
	}

	componentDidUpdate() {
		if(this.props.items.length && this.defaultAllowed) {
			this.defaultAllowed = false;
			this.defaultSelection();
		}
	}

	defaultSelection() {
		if(this.props.defaultSelected) {
			this.handleClick(this.props.defaultSelected);
		}
	}

	// Handler function is called when the list item is clicked
	handleClick(value) {
		// Pass the previously selected value to be removed from the query
		this.props.onRemove(this.state.selectedItem);
		// Pass the new selected value to be added to the query
		this.props.onSelect(value);
		this.setState({
			selectedItem: value
		});
	}

	render() {
		let items = this.props.items;
		let itemsComponent = [];
		// Build the array of components for each item
		items.forEach(function (item) {
			itemsComponent.push(<ItemRow
				key={item.key}
				value={item.key}
				doc_count={item.doc_count}
				countField={this.props.showCount}
				handleClick={this.handleClick}
				selectedItem={this.state.selectedItem}/>)
		}.bind(this));
		return (
			<div className="rbc-list-container col s12 col-xs-12">
				{itemsComponent}
			</div>
		);
	}
}

class ItemRow extends Component {
	constructor(props) {
		super(props);
	}

	renderItem() {
		let count;
		// Check if user wants to show count field
		if (this.props.countField) {
			count = <span className="rbc-count"> ({this.props.doc_count}) </span>;
		}
		let item = (
			<a href="javascript:void(0)" className={"col s12 col-xs-12"}>
				<span> {this.props.value} </span>
				{count}
			</a>
		);
		if(this.props.value === this.props.selectedItem) {
			item = (
				<a href="javascript:void(0)" className={"col s12 col-xs-12"}>
					<strong>
						<span> {this.props.value} </span>
						{count}
					</strong>
				</a>
			);
		}
		return item;
	}

	renderCount() {
		let count;
		// Check if user wants to show count field
		if (this.props.countField) {
			count = <span> ({this.props.doc_count}) </span>;
		}
		return count;
	}

	render() {
		// let activeClass = this.props.value === this.props.selectedItem ? 'active' : '';
		return (
			<div className="rbc-list-item row" onClick={() => this.props.handleClick(this.props.value)}>
				<input type="radio"
					className="rbc-radio-item"
					checked={this.props.value === this.props.selectedItem}
					value={this.props.value} />
				<label className="rbc-label">{this.props.value} {this.renderCount()}</label>
			</div>
		);
	}
}
