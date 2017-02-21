import React from 'react';
import { ReactiveBase, SingleDropdownRange, ReactiveList } from '../../app/app.js';
import {config} from './config';
import { mount } from 'enzyme';

function testComponent(cb) {
	const onData = function(err, res) {
		cb(err, res);
	}
	const component = mount(
		<ReactiveBase
				app={config.ReactiveBase.app}
				username={config.ReactiveBase.username}
				password={config.ReactiveBase.password}
			>
			<div className="row">
				<div className="col s6 col-xs-6">
					<SingleDropdownRange
						componentId="CitySensor"
						appbaseField={config.mapping.price}
						title="SingleDropdownRange"
						defaultSelected={config.SingleDropdownRange.defaultSelected}
						data={config.SingleDropdownRange.data}
						size={100}
					/>
				</div>
				<div className="col s6 col-xs-6">
					<ReactiveList
						componentId="SearchResult"
						appbaseField={config.mapping.name}
						title="Results"
						sortBy={config.ReactiveList.sortBy}
						from={config.ReactiveList.from}
						size={config.ReactiveList.size}
						onData={onData}
						requestOnScroll={true}
						react={{
							'and': ["CitySensor"]
						}}
					/>
				</div>
			</div>
		</ReactiveBase>
	);
}
export var SingleDropdownRangeTest = function() {
	return new Promise((resolve, reject) => {
		testComponent(function(err, res) {
			if (err) {
				reject(err);
			} else if (res) {
				resolve(res);
			}
		});
	});
}
