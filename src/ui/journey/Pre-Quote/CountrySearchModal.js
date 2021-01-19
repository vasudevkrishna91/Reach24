import React, {Component} from 'react';
import { Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import { default as countryData } from '../../../lib/countryData.json';


class CountrySearchModal extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
                <p class="search">Search Countries</p>
                <Autocomplete
                    id="combo-box-demo"
                    options={countryData}
                    getOptionLabel={option => option.city}
                    style={{ width: 650}}
                    renderInput={params => {
                    return    (
                        <TextField {...params} fullWidth
                        value={this.props.searchValue} 
                        />
                    )}}
                    autoSelect={true}
                    multiple={true}
                />
            </div>
        )
    }
}

export default CountrySearchModal;
